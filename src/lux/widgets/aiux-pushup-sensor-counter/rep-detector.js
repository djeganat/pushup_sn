/**
 * Push-up rep detection from device input. Pure logic — no DOM — so it can be unit tested.
 * Times are milliseconds (e.g. performance.now() or event.timeStamp).
 */

/**
 * Touch mode: the phone lies on the floor and the chest/nose touches the screen
 * at the bottom of each rep. A tap counts only after `minIntervalMs` since the
 * last counted rep, which rejects double taps and bounces.
 */
export class TouchRepDetector {
  constructor({minIntervalMs = 450} = {}) {
    this.minIntervalMs = minIntervalMs;
    this.reset();
  }

  reset() {
    this.reps = 0;
    this._last = -Infinity;
  }

  /** Returns true when the tap counted as a rep. */
  tap(t) {
    if (t - this._last < this.minIntervalMs) return false;
    this._last = t;
    this.reps += 1;
    return true;
  }
}

/** Accelerometer sensitivity presets: threshold in m/s² on the filtered signal. */
export const MOTION_SENSITIVITY = Object.freeze({low: 1.6, medium: 1.0, high: 0.6});

/**
 * Motion mode: the phone is in a pocket or armband. Each push-up moves the body
 * down and back up, producing one negative and one positive swing of vertical
 * acceleration around gravity.
 *
 * Pipeline per sample:
 *   1. magnitude of accelerationIncludingGravity (orientation independent)
 *   2. slow EMA tracks the gravity baseline; dynamic = magnitude - baseline
 *   3. fast EMA smooths sensor noise
 *   4. hysteresis state machine: a rep is one excursion below -threshold
 *      followed by one above +threshold (either order), with the cycle
 *      lasting between minIntervalMs and maxIntervalMs.
 */
export class MotionRepDetector {
  constructor({threshold = MOTION_SENSITIVITY.medium, minIntervalMs = 700, maxIntervalMs = 6000, baselineAlpha = 0.02, smoothAlpha = 0.3, warmupSamples = 20} = {}) {
    Object.assign(this, {threshold, minIntervalMs, maxIntervalMs, baselineAlpha, smoothAlpha, warmupSamples});
    this.reset();
  }

  reset() {
    this.reps = 0;
    this._baseline = null;
    this._smooth = 0;
    this._samples = 0;
    this._first = null; // 'neg' | 'pos' — first excursion of the current cycle
    this._cycleStart = 0;
    this._armed = true; // must return near zero before a new excursion is accepted
    this._lastRep = -Infinity;
    this.signal = 0;
  }

  /**
   * Feeds one accelerometer sample. Returns true when it completed a rep.
   * @param {{t:number, x:number, y:number, z:number}} s accelerationIncludingGravity in m/s²
   */
  feed({t, x, y, z}) {
    if (![x, y, z].every(Number.isFinite)) return false;
    const mag = Math.sqrt(x * x + y * y + z * z);
    this._baseline = this._baseline === null ? mag : this._baseline + this.baselineAlpha * (mag - this._baseline);
    const dyn = mag - this._baseline;
    this._smooth += this.smoothAlpha * (dyn - this._smooth);
    this.signal = this._smooth;
    if (++this._samples < this.warmupSamples) return false;

    const v = this._smooth;
    const th = this.threshold;
    if (Math.abs(v) < th * 0.4) this._armed = true; // back near rest
    if (!this._armed) return false;

    const dir = v <= -th ? 'neg' : v >= th ? 'pos' : null;
    if (!dir) {
      if (this._first && t - this._cycleStart > this.maxIntervalMs) this._first = null; // stale half-cycle
      return false;
    }
    this._armed = false;
    if (!this._first) {
      this._first = dir;
      this._cycleStart = t;
      return false;
    }
    if (dir === this._first) {
      this._cycleStart = t; // same direction again: restart the half-cycle
      return false;
    }
    // Opposite excursion completes the cycle.
    this._first = null;
    if (t - this._lastRep < this.minIntervalMs) return false;
    this._lastRep = t;
    this.reps += 1;
    return true;
  }
}
