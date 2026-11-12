/**
 * Push-up rep detection from MoveNet keypoints. Pure logic — no DOM, no TensorFlow —
 * so it can be unit tested. Keypoints follow the COCO-17 order MoveNet returns:
 * each {x, y, score}.
 */

export const KP = Object.freeze({
  NOSE: 0,
  L_SHOULDER: 5, R_SHOULDER: 6,
  L_ELBOW: 7, R_ELBOW: 8,
  L_WRIST: 9, R_WRIST: 10,
  L_HIP: 11, R_HIP: 12,
  L_KNEE: 13, R_KNEE: 14,
  L_ANKLE: 15, R_ANKLE: 16
});

const SIDES = {
  left: {shoulder: KP.L_SHOULDER, elbow: KP.L_ELBOW, wrist: KP.L_WRIST, hip: KP.L_HIP, knee: KP.L_KNEE},
  right: {shoulder: KP.R_SHOULDER, elbow: KP.R_ELBOW, wrist: KP.R_WRIST, hip: KP.R_HIP, knee: KP.R_KNEE}
};

/** Angle ABC in degrees (vertex at B), 0–180. */
export function angleAt(a, b, c) {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (!n) return NaN;
  const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Counts a rep when the elbow bends to `downAngle` or less and then extends to
 * `upAngle` or more, while the body stays straight (shoulder–hip–knee angle at
 * least `minBodyAngle`, when the knee is visible). Uses the better-visible side.
 */
export class PoseRepDetector {
  constructor({downAngle = 95, upAngle = 150, minScore = 0.3, minBodyAngle = 140, smoothAlpha = 0.5, minIntervalMs = 500} = {}) {
    Object.assign(this, {downAngle, upAngle, minScore, minBodyAngle, smoothAlpha, minIntervalMs});
    this.reset();
  }

  reset() {
    this.reps = 0;
    this.phase = 'up'; // 'up' | 'down'
    this._angle = null;
    this._lastRep = -Infinity;
    this._badFormInRep = false;
  }

  _pickSide(kps) {
    let best = null;
    for (const [name, s] of Object.entries(SIDES)) {
      const pts = [s.shoulder, s.elbow, s.wrist].map(i => kps[i]);
      if (pts.some(p => !p || p.score < this.minScore)) continue;
      const score = pts.reduce((sum, p) => sum + p.score, 0);
      if (!best || score > best.score) best = {name, s, score};
    }
    return best;
  }

  /**
   * Feeds one pose. Returns a frame summary:
   * {counted, visible, side, elbowAngle, bodyAngle, formOk, phase}
   */
  feed(keypoints, t) {
    const out = {counted: false, visible: false, side: null, elbowAngle: null, bodyAngle: null, formOk: true, phase: this.phase};
    const kps = keypoints || [];
    const pick = this._pickSide(kps);
    if (!pick) return out;
    const {s} = pick;
    out.visible = true;
    out.side = pick.name;

    const raw = angleAt(kps[s.shoulder], kps[s.elbow], kps[s.wrist]);
    if (!Number.isFinite(raw)) return out;
    this._angle = this._angle === null ? raw : this._angle + this.smoothAlpha * (raw - this._angle);
    out.elbowAngle = this._angle;

    const hip = kps[s.hip], knee = kps[s.knee];
    if (hip && knee && hip.score >= this.minScore && knee.score >= this.minScore) {
      out.bodyAngle = angleAt(kps[s.shoulder], hip, knee);
      out.formOk = !(out.bodyAngle < this.minBodyAngle);
    }

    if (this.phase === 'up') {
      if (this._angle <= this.downAngle) {
        this.phase = 'down';
        this._badFormInRep = !out.formOk;
      }
    } else {
      if (!out.formOk) this._badFormInRep = true;
      if (this._angle >= this.upAngle) {
        this.phase = 'up';
        if (!this._badFormInRep && t - this._lastRep >= this.minIntervalMs) {
          this._lastRep = t;
          this.reps += 1;
          out.counted = true;
        }
      }
    }
    out.phase = this.phase;
    return out;
  }
}
