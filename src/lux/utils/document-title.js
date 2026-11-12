import {isServer} from 'lit';
import {i18n} from '@servicenow/aiux/aiux-services';

/** Sets the browser tab title as "<page> · FitChallenge" (WCAG 2.4.2). */
export function setDocumentTitle(pageTitle) {
  if (isServer) return;
  const app = i18n.getMessage('FitChallenge');
  document.title = pageTitle ? `${pageTitle} · ${app}` : app;
}
