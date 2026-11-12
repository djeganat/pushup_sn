import {html, css, nothing, isServer} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {AIUXWidgetElement, decorators, getLogger} from '@servicenow/aiux-components-core';
import {i18n} from '@servicenow/aiux-services';
import {icon} from '@servicenow/aiux-directive-icon';
import '@servicenow/aiux-timer';
import '@servicenow/aiux-components-alert';
import {TouchRepDetector, MotionRepDetector, MOTION_SENSITIVITY} from './rep-detector.js';
import {DETECTION, saveErrorMessage, logPushups, previewResult, keepScreenOn, durationSeconds, resolveLocale, formatNumber} from '../../components/fitchallenge-api.js';
import '../../components/fitchallenge-session-result.js';

const {name, description, discoverable, bestFor, category} = decorators;
const log = getLogger('aiux-pushup-sensor-counter');

/** How long to wait for the first accelerometer sample before reporting "no sensor". */
const MOTION_WATCHDOG_MS = 2500;

@customElement('aiux-pushup-sensor-counter')
@discoverable(true)
@name('Push-up Counter (Sensors)')
@description('Counts push-ups with the device touch screen or accelerometer and saves the set to FitChallenge for XP, streaks and badges.')
@bestFor('Logging a push-up set on a phone in FitChallenge without a camera: tap-the-screen counting or motion sensing from a pocket or armband')
@category('custom')
export default class AiuxPushupSensorCounter extends AIUXWidgetElement {
  static properties = {
    /** Initial counting mode: 'touch' or 'motion'. */
    mode: {type: String},
    /** Simulate saving with sample data instead of calling the API (playground / demos). */
    preview: {type: Boolean},
    _phase: {type: String, state: true}, // setup | running | review | saving | saved
    _mode: {type: String, state: true},
    _sensitivity: {type: String, state: true},
    _reps: {type: Number, state: true},
    _detectedReps: {type: Number, state: true},
    _startedAt: {type: Number, state: true},
    _endedAt: {type: Number, state: true},
    _signal: {type: Number, state: true},
    _pulse: {type: Boolean, state: true},
    _error: {type: String, state: true},
    _result: {type: Object, state: true}
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .count {
      font-size: clamp(3.5rem, 18vw, 6rem);
      line-height: 1;
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary, #000);
    }
    .tap-pad {
      min-height: 12rem;
      width: 100%;
      border-radius: var(--radius-box, 1rem);
      border: 2px dashed var(--color-primary, #007b9e);
      background: var(--color-base-200, #f2f2f2);
      color: var(--color-text-primary, #000);
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
      cursor: pointer;
    }
    .tap-pad:focus-visible {
      outline: 3px solid var(--color-primary, #007b9e);
      outline-offset: 2px;
    }
    .signal-track {
      height: 0.5rem;
      border-radius: 9999px;
      background: var(--color-base-300, #e5e7eb);
      overflow: hidden;
    }
    .signal-bar {
      height: 100%;
      background: var(--color-primary, #007b9e);
    }
    @media (prefers-reduced-motion: no-preference) {
      .count.pulse {
        animation: pulse 180ms linear;
      }
      .signal-bar {
        transition: width 80ms linear;
      }
    }
    @keyframes pulse {
      50% {
        transform: scale(1.08);
      }
    }
    @media (forced-colors: active) {
      .card {
        border: 1px solid CanvasText;
      }
      .tap-pad {
        forced-color-adjust: none;
        background-color: ButtonFace;
        color: ButtonText;
        border: 2px solid ButtonBorder;
      }
      .tap-pad:hover {
        background-color: Highlight;
        color: HighlightText;
      }
      .tap-pad:focus-visible {
        outline: 3px solid Highlight;
      }
      .discard-btn {
        forced-color-adjust: none;
        background-color: ButtonFace;
        color: ButtonText;
        border: 2px solid ButtonBorder;
      }
      .signal-track {
        border: 1px solid CanvasText;
      }
      .signal-bar {
        forced-color-adjust: none;
        background-color: CanvasText;
      }
    }
  `;

  constructor() {
    super();
    this.mode = 'touch';
    this.preview = false;
    this._phase = 'setup';
    this._mode = 'touch';
    this._sensitivity = 'medium';
    this._reps = 0;
    this._detectedReps = 0;
    this._startedAt = 0;
    this._endedAt = 0;
    this._signal = 0;
    this._pulse = false;
    this._error = '';
    this._result = null;
    this._touch = new TouchRepDetector();
    this._motion = null;
    this._motionSamples = 0;
    this._watchdog = null;
    this._pulseTimer = null;
    this._releaseWakeLock = null;
  }

  willUpdate(changed) {
    if (changed.has('mode') && this._phase === 'setup') {
      this._mode = this.mode === 'motion' ? 'motion' : 'touch';
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopSensors();
    clearTimeout(this._pulseTimer);
  }

  /* ---------------- session control ---------------- */

  async _start() {
    this._error = '';
    this._reps = 0;
    this._detectedReps = 0;
    this._signal = 0;
    this._result = null;
    try {
      if (this._mode === 'motion') {
        await this._startMotion();
      } else {
        this._touch.reset();
      }
    } catch (e) {
      log.warn({err: e?.name}, 'motion sensor unavailable');
      this._error = e?.name === 'NotAllowedError'
        ? i18n.getMessage('Motion sensor access was denied. Allow motion access in your browser settings, or use touch mode.')
        : i18n.getMessage('This device does not provide motion sensor data. Use touch mode instead.');
      this._stopSensors();
      return;
    }
    this._startedAt = Date.now();
    this._endedAt = 0;
    this._phase = 'running';
    this._releaseWakeLock = await keepScreenOn();
    this._focus(this._mode === 'touch' ? '.tap-pad' : '.stop-btn');
  }

  async _startMotion() {
    if (isServer || typeof DeviceMotionEvent === 'undefined') {
      throw Object.assign(new Error('unsupported'), {name: 'NotSupportedError'});
    }
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      const state = await DeviceMotionEvent.requestPermission(); // iOS: must run from the click
      if (state !== 'granted') throw Object.assign(new Error('denied'), {name: 'NotAllowedError'});
    }
    this._motion = new MotionRepDetector({threshold: MOTION_SENSITIVITY[this._sensitivity]});
    this._motionSamples = 0;
    window.addEventListener('devicemotion', this._onMotion);
    this._watchdog = setTimeout(() => {
      if (this._motionSamples === 0 && this._phase === 'running') {
        this._stopSensors();
        this._phase = 'setup';
        this._error = i18n.getMessage('This device does not provide motion sensor data. Use touch mode instead.');
        this._focus('.start-btn');
      }
    }, MOTION_WATCHDOG_MS);
  }

  _stopSensors() {
    if (!isServer) window.removeEventListener('devicemotion', this._onMotion);
    clearTimeout(this._watchdog);
    this._watchdog = null;
    const release = this._releaseWakeLock;
    this._releaseWakeLock = null;
    if (release) release();
  }

  _stop() {
    this._stopSensors();
    this._endedAt = Date.now();
    this._phase = 'review';
    this._focus(this._reps > 0 ? '.save-btn' : '.discard-btn');
  }

  _discard() {
    this._phase = 'setup';
    this._reps = 0;
    this._error = '';
    this._focus('.start-btn');
  }

  async _save() {
    if (this._phase === 'saving' || this._reps < 1) return;
    this._phase = 'saving';
    this._error = '';
    const method = this._reps === this._detectedReps ? DETECTION.SENSOR : DETECTION.MANUAL;
    const payload = {reps: this._reps, durationSeconds: durationSeconds(this._startedAt, this._endedAt), method};
    try {
      this._result = this.preview ? previewResult(payload.reps, method) : await logPushups(payload);
      this._phase = 'saved';
      this._focus('fitchallenge-session-result');
    } catch (e) {
      log.error({status: e?.status}, 'saving push-up session failed');
      this._error = saveErrorMessage(e);
      this._phase = 'review';
      this._focus('.save-btn');
    }
  }

  /* ---------------- rep events ---------------- */

  _onTap = e => {
    if (this._phase !== 'running') return;
    if (this._touch.tap(e.timeStamp || performance.now())) this._countRep(this._touch.reps);
  };

  _onMotion = e => {
    const a = e.accelerationIncludingGravity;
    if (!a || !this._motion) return;
    this._motionSamples += 1;
    const counted = this._motion.feed({t: e.timeStamp, x: a.x, y: a.y, z: a.z});
    if (this._motionSamples % 4 === 0) this._signal = Math.min(1, Math.abs(this._motion.signal) / (this._motion.threshold * 2));
    if (counted) this._countRep(this._motion.reps);
  };

  _countRep(total) {
    this._detectedReps = total;
    this._reps = total;
    this._pulse = true;
    clearTimeout(this._pulseTimer);
    this._pulseTimer = setTimeout(() => (this._pulse = false), 200);
    if (!isServer && navigator.vibrate) navigator.vibrate(25);
  }

  _adjust(delta) {
    this._reps = Math.max(0, Math.min(500, this._reps + delta));
  }

  /* ---------------- helpers ---------------- */

  _focus(selector) {
    this.updateComplete.then(() => this.renderRoot.querySelector(selector)?.focus());
  }

  _onModeChange = e => {
    this._mode = e.target.value;
  };

  _onSensitivityChange = e => {
    this._sensitivity = e.target.value;
  };

  _fmt(n) {
    return formatNumber(resolveLocale(this), n);
  }

  /* ---------------- render ---------------- */

  render() {
    return html`
      <article class="card aiux-card bg-base-100 shadow-sm h-full" aria-labelledby="sensor-title">
        <div class="aiux-card-body p-4 sm:p-6 gap-4">
          <header class="flex items-center gap-2 min-w-0">
            <span class="text-primary shrink-0">${icon({name: 'mobile-phone', size: 'lg'})}</span>
            <h2 id="sensor-title" class="text-lg font-medium text-text-primary break-words min-w-0">
              ${i18n.getMessage('Push-up counter')}
            </h2>
          </header>

          ${this._error
            ? html`<aiux-alert-message
                type="error"
                alert-title=${i18n.getMessage('Something went wrong')}
                message=${this._error}
                dismissible
                .autofocusControls=${false}
                @alert-dismiss=${() => (this._error = '')}
              ></aiux-alert-message>`
            : nothing}

          ${this._phase === 'setup' ? this._renderSetup() : nothing}
          ${this._phase === 'running' ? this._renderRunning() : nothing}
          ${this._phase === 'review' || this._phase === 'saving' ? this._renderReview() : nothing}
          ${this._phase === 'saved'
            ? html`<fitchallenge-session-result
                tabindex="-1"
                .result=${this._result}
                @fitchallenge-session-result:new-session=${this._discard}
              ></fitchallenge-session-result>`
            : nothing}
        </div>
      </article>
    `;
  }

  _renderSetup() {
    const touch = this._mode === 'touch';
    return html`
      <fieldset class="flex flex-col gap-2">
        <legend class="text-sm font-medium text-text-primary mb-1">${i18n.getMessage('Counting mode')}</legend>
        <label class="flex items-start gap-3 p-3 rounded-lg bg-base-200 cursor-pointer">
          <input type="radio" class="aiux-radio aiux-radio-primary mt-1" name="mode" value="touch" .checked=${touch} @change=${this._onModeChange} />
          <span class="min-w-0">
            <span class="block font-medium text-text-primary">${i18n.getMessage('Touch')}</span>
            <span class="block text-sm text-text-secondary break-words">
              ${i18n.getMessage('Place the phone under your chest and touch the screen at the bottom of each push-up.')}
            </span>
          </span>
        </label>
        <label class="flex items-start gap-3 p-3 rounded-lg bg-base-200 cursor-pointer">
          <input type="radio" class="aiux-radio aiux-radio-primary mt-1" name="mode" value="motion" .checked=${!touch} @change=${this._onModeChange} />
          <span class="min-w-0">
            <span class="block font-medium text-text-primary">${i18n.getMessage('Motion')}</span>
            <span class="block text-sm text-text-secondary break-words">
              ${i18n.getMessage('Keep the phone in a pocket or armband. Each push-up is detected from movement.')}
            </span>
          </span>
        </label>
      </fieldset>

      ${touch
        ? nothing
        : html`
            <fieldset class="flex flex-wrap gap-x-4 gap-y-2">
              <legend class="text-sm font-medium text-text-primary mb-1">${i18n.getMessage('Motion sensitivity')}</legend>
              ${[
                ['low', i18n.getMessage('Low')],
                ['medium', i18n.getMessage('Medium')],
                ['high', i18n.getMessage('High')]
              ].map(
                ([value, label]) => html`<label class="flex items-center gap-2 cursor-pointer min-h-11">
                  <input type="radio" class="aiux-radio aiux-radio-sm" name="sensitivity" value=${value} .checked=${this._sensitivity === value} @change=${this._onSensitivityChange} />
                  <span class="text-sm text-text-primary">${label}</span>
                </label>`
              )}
            </fieldset>
          `}

      <button type="button" class="start-btn aiux-btn aiux-btn-primary w-full min-h-11" @click=${this._start}>
        ${icon({name: 'play', size: 'sm'})} ${i18n.getMessage('Start set')}
      </button>
    `;
  }

  _renderRunning() {
    const touch = this._mode === 'touch';
    return html`
      <div class="flex flex-col items-center gap-2">
        <div role="status" class="flex flex-col items-center">
          <span class=${classMap({count: true, pulse: this._pulse})}>${this._fmt(this._reps)}</span>
          <span class="text-sm text-text-secondary">${i18n.getMessage('reps')}</span>
        </div>
        <aiux-timer start-time=${new Date(this._startedAt).toISOString()} icon="clock" size="md" .configAria=${{'aria-label': i18n.getMessage('Set duration')}}></aiux-timer>
      </div>

      ${touch
        ? html`<button
            type="button"
            class="tap-pad flex flex-col items-center justify-center gap-2 p-4"
            aria-label=${i18n.getMessage('Count a push-up')}
            aria-describedby="tap-hint"
            @click=${this._onTap}
          >
            ${icon({name: 'hand-pointer', size: 'xl'})}
            <span id="tap-hint" class="text-sm text-center break-words max-w-full">
              ${i18n.getMessage('Touch here at the bottom of each push-up (or press Space)')}
            </span>
          </button>`
        : html`<div class="flex flex-col gap-2">
            <p class="text-sm text-text-secondary text-center break-words">
              ${i18n.getMessage('Counting from movement. Keep the phone still in your pocket or armband.')}
            </p>
            <div class="signal-track" aria-hidden="true">
              <div class="signal-bar" style="width:${Math.round(this._signal * 100)}%"></div>
            </div>
          </div>`}

      <button type="button" class="stop-btn aiux-btn aiux-btn-neutral w-full min-h-11" @click=${this._stop}>
        ${icon({name: 'stop', size: 'sm'})} ${i18n.getMessage('Finish set')}
      </button>
    `;
  }

  _renderReview() {
    const saving = this._phase === 'saving';
    const adjusted = this._reps !== this._detectedReps;
    return html`
      <div class="flex flex-col items-center gap-3">
        <h3 class="text-base font-medium text-text-primary">${i18n.getMessage('Review your set')}</h3>
        <div class="flex items-center gap-4">
          <button type="button" class="aiux-btn aiux-btn-circle aiux-btn-outline min-h-11 min-w-11" aria-label=${i18n.getMessage('Remove one push-up')} ?disabled=${saving || this._reps <= 0} @click=${() => this._adjust(-1)}>
            ${icon({name: 'minus', size: 'md'})}
          </button>
          <span role="status" class="count" aria-label=${i18n.getMessage({message: 'Push-ups: {0}', comment: '{0} = rep count'}, [this._fmt(this._reps)])}>${this._fmt(this._reps)}</span>
          <button type="button" class="aiux-btn aiux-btn-circle aiux-btn-outline min-h-11 min-w-11" aria-label=${i18n.getMessage('Add one push-up')} ?disabled=${saving || this._reps >= 500} @click=${() => this._adjust(1)}>
            ${icon({name: 'plus', size: 'md'})}
          </button>
        </div>
        <aiux-timer start-time=${new Date(this._startedAt).toISOString()} end-time=${new Date(this._endedAt).toISOString()} icon="clock" size="sm" .configAria=${{'aria-label': i18n.getMessage('Set duration')}}></aiux-timer>
        ${adjusted
          ? html`<p class="text-sm text-text-secondary text-center break-words max-w-full">
              ${i18n.getMessage('You changed the detected count, so this set will be saved as a manual entry.')}
            </p>`
          : nothing}
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <button type="button" class="save-btn aiux-btn aiux-btn-primary flex-1 min-h-11" ?disabled=${saving || this._reps < 1} aria-busy=${saving ? 'true' : 'false'} @click=${this._save}>
          ${saving ? html`<span class="aiux-loading aiux-loading-spinner aiux-loading-xs" aria-hidden="true"></span>` : icon({name: 'check', size: 'sm'})}
          ${saving ? i18n.getMessage('Saving…') : i18n.getMessage('Save set')}
        </button>
        <button type="button" class="discard-btn aiux-btn aiux-btn-ghost flex-1 min-h-11" ?disabled=${saving} @click=${this._discard}>
          ${i18n.getMessage('Discard')}
        </button>
      </div>
    `;
  }
}
