import {html, css, nothing, isServer} from 'lit';
import {customElement} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {AIUXWidgetElement, decorators, getLogger} from '@servicenow/aiux-components-core';
import {i18n} from '@servicenow/aiux-services';
import {icon} from '@servicenow/aiux-directive-icon';
import '@servicenow/aiux-timer';
import '@servicenow/aiux-components-alert';
import '@servicenow/aiux-components-loader';
import {PoseRepDetector, KP} from './pose-rep-detector.js';
import {getMoveNetDetector} from './movenet-loader.js';
import {DETECTION, saveErrorMessage, logPushups, previewResult, keepScreenOn, durationSeconds, resolveLocale, formatNumber} from '../../components/fitchallenge-api.js';
import '../../components/fitchallenge-session-result.js';

const {name, description, discoverable, bestFor, category} = decorators;
const log = getLogger('aiux-pushup-camera-counter');

const SKELETON = {
  left: [[KP.L_SHOULDER, KP.L_ELBOW], [KP.L_ELBOW, KP.L_WRIST], [KP.L_SHOULDER, KP.L_HIP], [KP.L_HIP, KP.L_KNEE], [KP.L_KNEE, KP.L_ANKLE]],
  right: [[KP.R_SHOULDER, KP.R_ELBOW], [KP.R_ELBOW, KP.R_WRIST], [KP.R_SHOULDER, KP.R_HIP], [KP.R_HIP, KP.R_KNEE], [KP.R_KNEE, KP.R_ANKLE]]
};

@customElement('aiux-pushup-camera-counter')
@discoverable(true)
@name('Push-up Counter (AI Camera)')
@description('Counts push-ups from the device camera with on-device pose detection (MoveNet), checks form, and saves the set to FitChallenge.')
@bestFor('Hands-free push-up counting in FitChallenge with form checking, using a phone, tablet or laptop camera placed beside the user')
@category('custom')
export default class AiuxPushupCameraCounter extends AIUXWidgetElement {
  static properties = {
    /** Simulate saving with sample data instead of calling the API (playground / demos). */
    preview: {type: Boolean},
    _phase: {type: String, state: true}, // setup | loading | running | review | saving | saved
    _reps: {type: Number, state: true},
    _detectedReps: {type: Number, state: true},
    _visible: {type: Boolean, state: true},
    _formOk: {type: Boolean, state: true},
    _startedAt: {type: Number, state: true},
    _endedAt: {type: Number, state: true},
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
      font-size: clamp(3rem, 16vw, 5rem);
      line-height: 1;
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary, #000);
    }
    .stage {
      position: relative;
      width: 100%;
      max-width: 40rem;
      margin-inline: auto;
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-box, 1rem);
      overflow: hidden;
      background: var(--color-neutral, #1e293b);
    }
    .stage video,
    .stage canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1); /* mirror view, like a selfie */
    }
    .chips {
      position: absolute;
      inset-inline: 0.5rem;
      top: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: var(--text-xs, 0.75rem);
      background: var(--color-base-100, #fff);
      color: var(--color-text-primary, #000);
      max-width: 100%;
    }
    .chip.warn {
      background: var(--color-warning, #f59e0b);
      color: var(--color-warning-content, #000);
    }
    @media (prefers-reduced-motion: no-preference) {
      .count.pulse {
        animation: pulse 180ms linear;
      }
    }
    @keyframes pulse {
      50% {
        transform: scale(1.08);
      }
    }
    @media (forced-colors: active) {
      .card,
      .stage,
      .chip {
        border: 1px solid CanvasText;
      }
      .chip,
      .chip.warn {
        background: Canvas;
        color: CanvasText;
      }
      .discard-btn {
        forced-color-adjust: none;
        background-color: ButtonFace;
        color: ButtonText;
        border: 2px solid ButtonBorder;
      }
    }
  `;

  constructor() {
    super();
    this.preview = false;
    this._phase = 'setup';
    this._reps = 0;
    this._detectedReps = 0;
    this._visible = false;
    this._formOk = true;
    this._startedAt = 0;
    this._endedAt = 0;
    this._pulse = false;
    this._error = '';
    this._result = null;
    this._pose = new PoseRepDetector();
    this._stream = null;
    this._detector = null;
    this._raf = 0;
    this._pulseTimer = null;
    this._releaseWakeLock = null;
    this._colors = {ok: '#007b9e', warn: '#f59e0b'};
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopCamera();
    clearTimeout(this._pulseTimer);
  }

  firstUpdated() {
    const cs = getComputedStyle(this);
    this._colors = {
      ok: cs.getPropertyValue('--color-primary').trim() || '#007b9e',
      warn: cs.getPropertyValue('--color-warning').trim() || '#f59e0b'
    };
  }

  /* ---------------- session control ---------------- */

  async _start() {
    this._error = '';
    this._result = null;
    this._phase = 'loading';
    this._focus('.cancel-btn');
    let stream = null;
    try {
      if (isServer || !navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error('insecure'), {name: 'InsecureContextError'});
      }
      const [cam, model] = await Promise.allSettled([
        navigator.mediaDevices.getUserMedia({video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 480}}, audio: false}),
        getMoveNetDetector()
      ]);
      if (cam.status === 'fulfilled') stream = cam.value;
      if (cam.status === 'rejected') throw cam.reason;
      if (model.status === 'rejected') throw model.reason;
      if (this._phase !== 'loading') {
        stream.getTracks().forEach(t => t.stop()); // cancelled while loading
        return;
      }
      this._stream = stream;
      this._detector = model.value;
      this._pose.reset();
      this._reps = 0;
      this._detectedReps = 0;
      this._visible = false;
      this._formOk = true;
      this._phase = 'running';
      await this.updateComplete;
      const video = this.renderRoot.querySelector('video');
      video.srcObject = stream;
      await video.play();
      this._startedAt = Date.now();
      this._endedAt = 0;
      this._releaseWakeLock = await keepScreenOn();
      this._focus('.stop-btn');
      this._raf = requestAnimationFrame(this._loop);
    } catch (e) {
      log.warn({err: e?.name}, 'camera session could not start');
      if (stream) stream.getTracks().forEach(t => t.stop());
      this._stopCamera();
      this._phase = 'setup';
      this._error = this._startErrorMessage(e);
      this._focus('.start-btn');
    }
  }

  _startErrorMessage(e) {
    switch (e?.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return i18n.getMessage('Camera access was denied. Allow camera access in your browser settings and try again.');
      case 'NotFoundError':
      case 'OverconstrainedError':
        return i18n.getMessage('No camera was found on this device. Use the sensor counter instead.');
      case 'NotReadableError':
        return i18n.getMessage('The camera is being used by another app. Close it and try again.');
      case 'InsecureContextError':
        return i18n.getMessage('The camera is only available on a secure (HTTPS) page.');
      case 'ModelLoadError':
        return i18n.getMessage('The pose detection model could not be loaded. Your network or instance security settings may block it. Use the sensor counter instead.');
      default:
        return i18n.getMessage('The camera counter could not start. Try again.');
    }
  }

  _cancel() {
    this._phase = 'setup';
    this._focus('.start-btn');
  }

  _stopCamera() {
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    if (this._stream) this._stream.getTracks().forEach(t => t.stop());
    this._stream = null;
    const video = this.renderRoot?.querySelector?.('video');
    if (video) video.srcObject = null;
    const release = this._releaseWakeLock;
    this._releaseWakeLock = null;
    if (release) release();
  }

  _stop() {
    this._stopCamera();
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
    const method = this._reps === this._detectedReps ? DETECTION.CAMERA : DETECTION.MANUAL;
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

  /* ---------------- detection loop ---------------- */

  _loop = async () => {
    if (this._phase !== 'running') return;
    const video = this.renderRoot.querySelector('video');
    if (video && video.readyState >= 2 && this._detector) {
      try {
        const poses = await this._detector.estimatePoses(video, {flipHorizontal: false});
        if (this._phase !== 'running') return;
        const kps = poses?.[0]?.keypoints;
        const frame = this._pose.feed(kps, performance.now());
        this._visible = frame.visible;
        this._formOk = frame.formOk;
        if (frame.counted) this._countRep(this._pose.reps);
        this._draw(video, kps, frame);
      } catch (e) {
        log.warn({err: e?.name}, 'pose estimation failed for a frame');
      }
    }
    this._raf = requestAnimationFrame(this._loop);
  };

  _draw(video, kps, frame) {
    const canvas = this.renderRoot.querySelector('canvas');
    if (!canvas) return;
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!kps || !frame.side) return;
    const color = frame.formOk ? this._colors.ok : this._colors.warn;
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    for (const [a, b] of SKELETON[frame.side]) {
      const p = kps[a], q = kps[b];
      if (!p || !q || p.score < 0.3 || q.score < 0.3) continue;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
    for (const i of new Set(SKELETON[frame.side].flat())) {
      const p = kps[i];
      if (!p || p.score < 0.3) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _countRep(total) {
    this._detectedReps = total;
    this._reps = total;
    this._pulse = true;
    clearTimeout(this._pulseTimer);
    this._pulseTimer = setTimeout(() => (this._pulse = false), 200);
  }

  _adjust(delta) {
    this._reps = Math.max(0, Math.min(500, this._reps + delta));
  }

  _focus(selector) {
    this.updateComplete.then(() => this.renderRoot.querySelector(selector)?.focus());
  }

  _fmt(n) {
    return formatNumber(resolveLocale(this), n);
  }

  /* ---------------- render ---------------- */

  render() {
    return html`
      <article class="card aiux-card bg-base-100 shadow-sm h-full" aria-labelledby="camera-title">
        <div class="aiux-card-body p-4 sm:p-6 gap-4">
          <header class="flex items-center gap-2 min-w-0">
            <span class="text-primary shrink-0">${icon({name: 'video-camera', size: 'lg'})}</span>
            <h2 id="camera-title" class="text-lg font-medium text-text-primary break-words min-w-0">
              ${i18n.getMessage('AI camera push-up counter')}
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
          ${this._phase === 'loading' ? this._renderLoading() : nothing}
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
    return html`
      <ol class="list-decimal ps-5 flex flex-col gap-1 text-sm text-text-primary">
        <li class="break-words">${i18n.getMessage('Place the device on the floor 1–2 metres to your side.')}</li>
        <li class="break-words">${i18n.getMessage('Make sure your shoulders, arms and hips are in view.')}</li>
        <li class="break-words">${i18n.getMessage('Lower until your elbows bend to about 90°, then push back up.')}</li>
      </ol>
      <p class="flex items-start gap-2 text-sm text-text-secondary break-words">
        <span class="shrink-0">${icon({name: 'lock', size: 'sm'})}</span>
        <span>${i18n.getMessage('Video is processed on this device only. Nothing is recorded or uploaded — only your rep count and time are saved.')}</span>
      </p>
      <button type="button" class="start-btn aiux-btn aiux-btn-primary w-full min-h-11" @click=${this._start}>
        ${icon({name: 'video-camera', size: 'sm'})} ${i18n.getMessage('Start camera')}
      </button>
    `;
  }

  _renderLoading() {
    return html`
      <div class="h-40">
        <aiux-loader size="lg" label=${i18n.getMessage('Starting camera and loading pose model…')}></aiux-loader>
      </div>
      <button type="button" class="cancel-btn discard-btn aiux-btn aiux-btn-ghost w-full min-h-11" @click=${this._cancel}>
        ${i18n.getMessage('Cancel')}
      </button>
    `;
  }

  _renderRunning() {
    const status = !this._visible
      ? i18n.getMessage('Move so your side is in view')
      : !this._formOk
        ? i18n.getMessage('Keep your body straight')
        : i18n.getMessage('Tracking');
    const warn = !this._visible || !this._formOk;
    return html`
      <div class="stage">
        <video playsinline muted aria-hidden="true"></video>
        <canvas aria-hidden="true"></canvas>
        <div class="chips">
          <span role="status" class=${classMap({chip: true, warn})}>
            ${icon({name: warn ? 'triangle-exclamation' : 'circle-check', size: 'xs'})}
            <span class="break-words">${status}</span>
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <div role="status" class="flex flex-col items-center">
          <span class=${classMap({count: true, pulse: this._pulse})}>${this._fmt(this._reps)}</span>
          <span class="text-sm text-text-secondary">${i18n.getMessage('reps')}</span>
        </div>
        <aiux-timer start-time=${new Date(this._startedAt || Date.now()).toISOString()} icon="clock" size="md" .configAria=${{'aria-label': i18n.getMessage('Set duration')}}></aiux-timer>
      </div>

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
