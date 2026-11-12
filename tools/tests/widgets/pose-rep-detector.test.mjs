import test from 'node:test';
import assert from 'node:assert/strict';
import {PoseRepDetector, angleAt, KP} from '../../../widgets/aiux-pushup-camera-counter/pose-rep-detector.js';

const deg = d => (d * Math.PI) / 180;
/** Side-view pose: shoulder at origin; elbow angle `elbow`; body angle (shoulder-hip-knee) `body`. */
function pose({elbow = 170, body = 175, side = 'left', score = 0.9, hideKnee = false} = {}) {
  const kps = Array.from({length: 17}, () => ({x: 0, y: 0, score: 0.05}));
  const S = side === 'left' ? {s: KP.L_SHOULDER, e: KP.L_ELBOW, w: KP.L_WRIST, h: KP.L_HIP, k: KP.L_KNEE} : {s: KP.R_SHOULDER, e: KP.R_ELBOW, w: KP.R_WRIST, h: KP.R_HIP, k: KP.R_KNEE};
  const sh = {x: 100, y: 100};
  const el = {x: 100, y: 150};                      // upper arm straight down
  const a = deg(180 - elbow);                        // forearm rotated so angle at elbow = `elbow`
  const wr = {x: el.x + 50 * Math.sin(a), y: el.y + 50 * Math.cos(a)};
  const hip = {x: 200, y: 100};                      // torso horizontal
  const b = deg(180 - body);
  const knee = {x: hip.x + 80 * Math.cos(b), y: hip.y + 80 * Math.sin(b)};
  Object.assign(kps[S.s], sh, {score}); Object.assign(kps[S.e], el, {score}); Object.assign(kps[S.w], wr, {score});
  Object.assign(kps[S.h], hip, {score}); Object.assign(kps[S.k], knee, {score: hideKnee ? 0.05 : score});
  return kps;
}
function run(det, frames) { let t = 0, c = 0; for (const f of frames) { if (det.feed(f, t).counted) c++; t += 33; } return c; }
function reps(n, opts = {}) {
  const frames = [];
  for (let k = 0; k < n; k++) {
    for (let a = 170; a >= 70; a -= 5) frames.push(pose({...opts, elbow: a}));
    for (let a = 70; a <= 170; a += 5) frames.push(pose({...opts, elbow: a}));
  }
  return frames;
}

test('angleAt: right angle and straight line', () => {
  assert.equal(Math.round(angleAt({x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0})), 90);
  assert.equal(Math.round(angleAt({x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0})), 180);
  assert.ok(Number.isNaN(angleAt({x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 0})));
});

test('pose fixture produces requested angles', () => {
  const k = pose({elbow: 90, body: 160});
  assert.equal(Math.round(angleAt(k[KP.L_SHOULDER], k[KP.L_ELBOW], k[KP.L_WRIST])), 90);
  assert.equal(Math.round(angleAt(k[KP.L_SHOULDER], k[KP.L_HIP], k[KP.L_KNEE])), 160);
});

test('counts 10 full reps', () => assert.equal(run(new PoseRepDetector(), reps(10)), 10));
test('works from the right side', () => assert.equal(run(new PoseRepDetector(), reps(5, {side: 'right'})), 5));
test('knee out of frame: still counts (no form check)', () => assert.equal(run(new PoseRepDetector(), reps(4, {hideKnee: true})), 4));

test('partial reps (elbow never below 110°) do not count', () => {
  const frames = [];
  for (let k = 0; k < 6; k++) { for (let a = 170; a >= 110; a -= 5) frames.push(pose({elbow: a})); for (let a = 110; a <= 170; a += 5) frames.push(pose({elbow: a})); }
  assert.equal(run(new PoseRepDetector(), frames), 0);
});

test('sagging hips (body angle 120°) do not count', () => assert.equal(run(new PoseRepDetector(), reps(5, {body: 120})), 0));

test('low-confidence keypoints: not visible, nothing counted', () => {
  const d = new PoseRepDetector();
  const r = d.feed(pose({score: 0.1}), 0);
  assert.equal(r.visible, false);
  assert.equal(run(d, reps(3, {score: 0.1})), 0);
});

test('jitter around the threshold does not double count', () => {
  const frames = [];
  for (let a = 170; a >= 80; a -= 5) frames.push(pose({elbow: a}));
  for (let i = 0; i < 20; i++) frames.push(pose({elbow: i % 2 ? 92 : 100}));   // hover at bottom
  for (let a = 100; a <= 170; a += 5) frames.push(pose({elbow: a}));
  for (let i = 0; i < 20; i++) frames.push(pose({elbow: i % 2 ? 148 : 156}));  // hover at top
  assert.equal(run(new PoseRepDetector(), frames), 1);
});

test('empty / missing keypoints are safe', () => {
  const d = new PoseRepDetector();
  assert.equal(d.feed(null, 0).visible, false);
  assert.equal(d.feed([], 0).counted, false);
});
