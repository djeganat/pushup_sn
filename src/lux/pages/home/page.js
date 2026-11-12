import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement, decorators} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {icon} from '@servicenow/aiux/aiux-directive-icon';
import {setDocumentTitle} from '../../utils/document-title.js';

const {global} = decorators;

@customElement('x-2167777-fitchal-home-page')
@global(false)
export default class HomePage extends AIUXElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100%;
      container-type: inline-size;
    }
  `;

  firstUpdated() {
    setDocumentTitle(i18n.getMessage('Home'));
  }

  _card(href, iconName, title, body, cta) {
    return html`
      <li class="aiux-card bg-base-100 shadow-sm">
        <div class="aiux-card-body">
          <span class="text-primary" aria-hidden="true">${icon({name: iconName, size: 'lg'})}</span>
          <h2 class="aiux-card-title text-text-primary break-words">${title}</h2>
          <p class="text-sm leading-relaxed text-text-secondary break-words">${body}</p>
          <div class="aiux-card-actions mt-2">
            <a class="aiux-btn aiux-btn-primary" href=${href}>${cta}</a>
          </div>
        </div>
      </li>
    `;
  }

  render() {
    return html`
      <div class="mx-auto max-w-5xl p-4">
        <header class="mb-6">
          <h1 class="text-3xl font-bold text-text-primary break-words">
            ${i18n.getMessage('FitChallenge push-ups')}
          </h1>
          <p class="mt-2 text-sm text-text-secondary break-words">
            ${i18n.getMessage('Count a push-up set and save it to earn XP, keep your streak and unlock badges.')}
          </p>
        </header>
        <ul class="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label=${i18n.getMessage('Ways to count push-ups')}>
          ${this._card(
            './camera',
            'video-camera',
            i18n.getMessage('AI camera counter'),
            i18n.getMessage('Place your device beside you. On-device pose detection counts reps and checks your form.'),
            i18n.getMessage('Start camera counter')
          )}
          ${this._card(
            './sensors',
            'mobile-phone',
            i18n.getMessage('Sensor counter'),
            i18n.getMessage('No camera needed. Tap the screen with your chest, or let the motion sensor count from a pocket or armband.'),
            i18n.getMessage('Start sensor counter')
          )}
        </ul>
      </div>
    `;
  }
}
