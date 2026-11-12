import {isServer} from 'lit';
import {aiuxFetch} from '@servicenow/aiux-components-core';
import {i18n} from '@servicenow/aiux-services';

/** FitChallenge Scripted REST API (x_fitchal_fitness), deployed in v1. */
export const ACTIVITY_ENDPOINT = '/api/x_fitchal_fitness/fitness/activity';

/** Detection methods accepted by the activity endpoint. */
export const DETECTION = Object.freeze({SENSOR: 'sensor', CAMERA: 'camera', MANUAL: 'manual'});

/**
 * Error raised when the activity endpoint rejects or fails a request.
 * `serverMessage` carries the API's own validation text (e.g. implausible rep pace).
 */
export class FitChallengeApiError extends Error {
  constructor(status, serverMessage) {
    super(serverMessage || `HTTP ${status}`);
    this.name = 'FitChallengeApiError';
    this.status = status;
    this.serverMessage = serverMessage || '';
  }
}

/**
 * Logs a push-up session. The server applies validation, XP scoring, the daily
 * cap, streaks and badges, and returns {activity, profile, new_badges}.
 */
export async function logPushups({reps, durationSeconds, method}) {
  const resp = await aiuxFetch(ACTIVITY_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({
      activity_type: 'pushup',
      reps_count: reps,
      duration: durationSeconds,
      detection_method: method
    })
  });
  let payload = null;
  try {
    payload = await resp.json();
  } catch {
    payload = null;
  }
  const result = payload?.result ?? null;
  if (!resp.ok) {
    throw new FitChallengeApiError(resp.status, result?.error || payload?.error?.message || '');
  }
  return result;
}

/** Sample API response used when a widget runs with `preview` set (playground / demos). */
export function previewResult(reps, method) {
  return {
    activity: {activity_type: 'pushup', reps_count: reps, xp_earned: reps, calories_burned: Math.round(reps * 0.4), detection_method: method},
    profile: {total_xp: 1250 + reps, level: 3, current_streak: 4, xp_remaining_today: Math.max(0, 1000 - reps)},
    new_badges: reps >= 20 ? ['Century'] : []
  };
}

/**
 * Keeps the screen awake during a session where supported. Returns an async
 * release function (always safe to call).
 */
export async function keepScreenOn() {
  if (isServer || !navigator.wakeLock?.request) return async () => {};
  try {
    const lock = await navigator.wakeLock.request('screen');
    return async () => {
      try {
        await lock.release();
      } catch {
        /* already released */
      }
    };
  } catch {
    return async () => {};
  }
}

/** Whole seconds between two epoch-ms timestamps, at least 1. */
export function durationSeconds(startedAt, endedAt) {
  return Math.max(1, Math.round((endedAt - startedAt) / 1000));
}

/** ServiceNow language codes that are not BCP 47, mapped to canonical tags. */
const SN_LOCALE_MAP = Object.freeze({pb: 'pt-BR', zt: 'zh-TW', fq: 'fr-CA', zh: 'zh-CN'});

/**
 * Resolves the user's locale for Intl formatting: the element's `lang`, then the
 * document's, mapped from ServiceNow codes to canonical BCP 47. SSR-safe.
 */
export function resolveLocale(el) {
  if (isServer) return 'en';
  const raw = (el?.closest?.('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'en').replace('_', '-');
  const tag = SN_LOCALE_MAP[raw.toLowerCase()] || raw;
  try {
    return Intl.getCanonicalLocales(tag)[0] || 'en';
  } catch {
    return 'en';
  }
}

/** Locale-aware integer/decimal formatting. */
export function formatNumber(locale, n, options) {
  return new Intl.NumberFormat(locale, options).format(Number(n) || 0);
}

/** Locale-aware kilocalories, e.g. "12 kcal". */
export function formatKcal(locale, n) {
  try {
    return new Intl.NumberFormat(locale, {style: 'unit', unit: 'kilocalorie', unitDisplay: 'short'}).format(Number(n) || 0);
  } catch {
    return formatNumber(locale, n);
  }
}

/** User-facing message for a failed save (see logPushups). */
export function saveErrorMessage(e) {
  if (e instanceof FitChallengeApiError) {
    if (e.status === 401 || e.status === 403) return i18n.getMessage('Sign in to save your session.');
    if (e.status === 400 && e.serverMessage) {
      return i18n.getMessage({message: 'The session was not accepted: {0}', comment: '{0} = validation message from the server'}, [e.serverMessage]);
    }
    return i18n.getMessage('The server could not save your session. Try again.');
  }
  return i18n.getMessage('Could not reach the server. Check your connection and try again.');
}
