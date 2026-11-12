import {html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement, decorators} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {setDocumentTitle} from '../../utils/document-title.js';
import '../../widgets/aiux-pushup-camera-counter/index.js';

const {global} = decorators;

@customElement('x-2167777-fitchal-camera-page')
@global(false)
export default class CameraPage extends AIUXElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  firstUpdated() {
    setDocumentTitle(i18n.getMessage('AI camera counter'));
  }

  render() {
    return html`
      <div class="mx-auto max-w-3xl p-4">
        <h1 class="mb-4 text-2xl font-bold text-text-primary break-words">
          ${i18n.getMessage('AI camera counter')}
        </h1>
        <aiux-pushup-camera-counter></aiux-pushup-camera-counter>
      </div>
    `;
  }
}
