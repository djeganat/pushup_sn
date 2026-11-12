import test from 'node:test';
import assert from 'node:assert/strict';
import {TouchRepDetector, MotionRepDetector, MOTION_SENSITIVITY} from '../../../src/lux/widgets/aiux-pushup-sensor-counter/rep-detector.js';

const G = 9.81, HZ = 60, DT = 1000 / HZ;
// Deterministic PRNG so noise is reproducible.
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296) - 0.5; }

/** Simulates n push-ups of `periodMs` each: one full sine cycle of vertical accel per rep, then rest. */
function simulate(det, {n, periodMs = 1500, amp = 3, noise = 0, restMs = 1500, tilt = 0}) {
  const r = rng(42); let t = 0, counted = 0;
  const push = (a) => { const z = G + a + noise * r(); const s = {t, x: Math.sin(tilt) * z, y: noise * r(), z: Math.cos(tilt) * z}; if (det.feed(s)) counted++; t += DT; };
  for (let i = 0; i < restMs / DT; i++) push(0);
  for (let k = 0; k < n; k++) for (let i = 0; i < periodMs / DT; i++) push(amp * Math.sin(2 * Math.PI * i / (periodMs / DT)));
  for (let i = 0; i < restMs / DT; i++) push(0);
  return counted;
}

test('touch: counts taps, rejects double taps inside min interval', () => {
  const d = new TouchRepDetector({minIntervalMs: 450});
  assert.equal(d.tap(0), true);
  assert.equal(d.tap(100), false);   // bounce
  assert.equal(d.tap(600), true);
  assert.equal(d.tap(1000), false);  // 400ms after last rep
  assert.equal(d.tap(1100), true);
  assert.equal(d.reps, 3);
  d.reset(); assert.equal(d.reps, 0);
});

test('motion: counts 10 clean reps exactly', () => {
  assert.equal(simulate(new MotionRepDetector(), {n: 10}), 10);
});

test('motion: counts 15 reps with sensor noise', () => {
  assert.equal(simulate(new MotionRepDetector(), {n: 15, noise: 0.6}), 15);
});

test('motion: orientation independent (phone tilted 60°)', () => {
  assert.equal(simulate(new MotionRepDetector(), {n: 8, tilt: Math.PI / 3}), 8);
});

test('motion: phone at rest with noise counts nothing', () => {
  assert.equal(simulate(new MotionRepDetector(), {n: 0, noise: 0.8, restMs: 10000}), 0);
});

test('motion: small movements below threshold ignored', () => {
  assert.equal(simulate(new MotionRepDetector({threshold: MOTION_SENSITIVITY.medium}), {n: 10, amp: 0.7}), 0);
});

test('motion: high sensitivity picks up gentle reps', () => {
  assert.equal(simulate(new MotionRepDetector({threshold: MOTION_SENSITIVITY.high}), {n: 10, amp: 1.2}), 10);
});

test('motion: implausibly fast bouncing (300ms cycles) is rate limited', () => {
  const c = simulate(new MotionRepDetector(), {n: 20, periodMs: 300, amp: 4});
  assert.ok(c <= 9, `counted ${c} of 20 bounces within 6s`);  // >= 700ms per rep
});

test('motion: ignores non-finite samples', () => {
  const d = new MotionRepDetector();
  assert.equal(d.feed({t: 0, x: NaN, y: 0, z: G}), false);
});
