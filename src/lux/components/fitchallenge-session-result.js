import {html, css, nothing} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {icon} from '@servicenow/aiux/aiux-directive-icon';
import {resolveLocale, formatNumber, formatKcal} from './fitchallenge-api.js';

/**
 * Shows the outcome of a saved FitChallenge session: XP earned, totals,
 * level, streak, XP left today and any newly earned badges.
 *
 * Property `result` is the `POST /activity` response: {activity, profile, new_badges}.
 * Fires `fitchallenge-session-result:new-session` when the user starts another session.
 */
@customElement('fitchallenge-session-result')
export default class FitchallengeSessionResult extends AIUXElement {
  static properties = {
    result: {type: Object}
  };

  static styles = css`
    :host {
      display: block;
    }
    .stat-value {
      font-size: var(--text-xl, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-text-primary, #000);
    }
    .stat-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--color-text-secondary, #4d4c4a);
    }
    .xp {
      color: var(--color-primary, #007b9e);
    }
    @media (forced-colors: active) {
      .stat,
      .badge-pill {
        border: 1px solid CanvasText;
      }
      .xp {
        color: CanvasText;
      }
    }
  `;

  constructor() {
    super();
    this.result = null;
  }

  _fmt(n) {
    return formatNumber(resolveLocale(this), n);
  }

  _newSession() {
    this.dispatchEvent(new CustomEvent('fitchallenge-session-result:new-session', {bubbles: true, composed: true}));
  }

  _renderStat(label, value) {
    return html`
      <div class="stat flex flex-col-reverse items-center rounded-lg bg-base-200 p-3 min-w-0">
        <dt class="stat-label text-center break-words max-w-full">${label}</dt>
        <dd class="stat-value break-words max-w-full">${value}</dd>
      </div>
    `;
  }

  render() {
    const r = this.result;
    if (!r) return nothing;
    const a = r.activity || {};
    const p = r.profile || {};
    const badges = r.new_badges || [];
    const capped = Number(a.xp_earned) === 0 && Number(a.reps_count) > 0;

    return html`
      <section class="flex flex-col gap-4" aria-labelledby="result-heading">
        <div role="status" class="flex flex-col items-center gap-1 text-center">
          <span class="text-success">${icon({name: 'circle-check', size: 'xl'})}</span>
          <h3 id="result-heading" class="text-lg font-medium text-text-primary break-words max-w-full">
            ${i18n.getMessage('Session saved')}
          </h3>
          <p class="xp text-2xl font-medium">
            ${i18n.getMessage({message: '+{0} XP', comment: 'Experience points earned in this session'}, [this._fmt(a.xp_earned)])}
          </p>
          <p class="text-sm text-text-secondary break-words max-w-full">
            ${i18n.getMessage({message: 'Push-ups: {0} · Calories: {1}', comment: '{0} = rep count, {1} = formatted calories such as "8 kcal"'}, [
              this._fmt(a.reps_count),
              formatKcal(resolveLocale(this), a.calories_burned)
            ])}
          </p>
          ${capped
            ? html`<p class="text-sm text-text-secondary break-words max-w-full">
                ${i18n.getMessage('Daily XP limit reached — reps still count toward challenges.')}
              </p>`
            : nothing}
        </div>

        <dl class="grid grid-cols-2 gap-2">
          ${this._renderStat(i18n.getMessage('Total XP'), this._fmt(p.total_xp))}
          ${this._renderStat(i18n.getMessage('Level'), this._fmt(p.level))}
          ${this._renderStat(i18n.getMessage('Day streak'), this._fmt(p.current_streak))}
          ${this._renderStat(i18n.getMessage('XP left today'), this._fmt(p.xp_remaining_today))}
        </dl>

        ${badges.length
          ? html`
              <div>
                <h4 class="text-sm font-medium text-text-primary mb-2">${i18n.getMessage('New badges')}</h4>
                <ul class="flex flex-wrap gap-2" aria-label=${i18n.getMessage('New badges')}>
                  ${badges.map(
                    b => html`<li class="badge-pill aiux-badge aiux-badge-success aiux-badge-soft gap-1 max-w-full">
                      ${icon({name: 'star', size: 'sm'})}<span class="break-words">${b}</span>
                    </li>`
                  )}
                </ul>
              </div>
            `
          : nothing}

        <button type="button" class="aiux-btn aiux-btn-primary w-full" @click=${this._newSession}>
          ${i18n.getMessage('Start another set')}
        </button>
      </section>
    `;
  }
}
