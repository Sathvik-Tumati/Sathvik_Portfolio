// Run with: node src/lib/mlp.check.mjs
// Fails if the network can no longer learn a pattern a straight line cannot separate,
// or if the contour tracer stops finding the line where a field crosses a level.
import assert from 'node:assert';
import { createNet, trainStep, predict, presets } from './mlp.js';
import { contour } from './contours.js';

for (const name of ['XOR', 'Circle']) {
  let best = 0;
  for (let attempt = 0; attempt < 3 && best < 0.95; attempt++) {
    const net = createNet();
    const points = presets[name]();
    let result;
    for (let i = 0; i < 4000; i++) result = trainStep(net, points);
    best = Math.max(best, result.accuracy);
    const p = predict(net, 0.5, 0.5);
    assert(p >= 0 && p <= 1, 'prediction must be a probability');
  }
  assert(best >= 0.95, `${name}: expected >= 95% accuracy, got ${(best * 100).toFixed(1)}%`);
  console.log(`${name}: ${(best * 100).toFixed(1)}% accuracy`);
}

// Distance from the centre of a 20x20 grid; the level-5 line is a circle of radius 5.
const n = 20, v = [];
for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) v.push(Math.hypot(c - 10, r - 10));
const segs = contour(v, n, n, 5);
assert(segs.length > 20, 'expected a closed ring of segments');
for (const [x1, y1, x2, y2] of segs) {
  for (const [x, y] of [[x1, y1], [x2, y2]]) assert(Math.abs(Math.hypot(x - 10, y - 10) - 5) < 0.2, 'point off the ring');
}
assert.strictEqual(contour(v, n, n, 100).length, 0, 'no line above the field');
console.log(`contours: ${segs.length} segments on the ring`);
console.log('mlp ok');
