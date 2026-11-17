// A small neural network (2 inputs -> 8 -> 8 -> 1 output) trained with plain
// full-batch gradient descent. No library: forward pass, backprop and the
// update are all here. Used by the in-page playground.

const H = 8;
const rand = (n) => Array.from({ length: n }, () => (Math.random() * 2 - 1) * 0.9);

export function createNet() {
  return { w1: rand(H * 2), b1: rand(H), w2: rand(H * H), b2: rand(H), w3: rand(H), b3: 0 };
}

// Probability that the point (x, y) belongs to class 1. Optionally fills h1/h2 for backprop.
export function predict(net, x, y, h1 = new Array(H), h2 = new Array(H)) {
  for (let i = 0; i < H; i++) h1[i] = Math.tanh(net.w1[i * 2] * x + net.w1[i * 2 + 1] * y + net.b1[i]);
  for (let i = 0; i < H; i++) {
    let sum = net.b2[i];
    for (let j = 0; j < H; j++) sum += net.w2[i * H + j] * h1[j];
    h2[i] = Math.tanh(sum);
  }
  let out = net.b3;
  for (let i = 0; i < H; i++) out += net.w3[i] * h2[i];
  return 1 / (1 + Math.exp(-out));
}

// One gradient-descent step over all points [{x, y, label}]. Returns { loss, accuracy }.
// `decay` is L2 weight decay: it keeps the network from becoming over-confident.
export function trainStep(net, points, lr = 0.5, decay = 0) {
  const n = points.length;
  if (!n) return { loss: 0, accuracy: 0 };
  const g = { w1: new Array(H * 2).fill(0), b1: new Array(H).fill(0), w2: new Array(H * H).fill(0), b2: new Array(H).fill(0), w3: new Array(H).fill(0), b3: 0 };
  const h1 = new Array(H), h2 = new Array(H), d2 = new Array(H), d1 = new Array(H);
  let loss = 0, correct = 0;

  for (const p of points) {
    const out = predict(net, p.x, p.y, h1, h2);
    loss -= p.label ? Math.log(out + 1e-9) : Math.log(1 - out + 1e-9);
    if (out > 0.5 === !!p.label) correct++;

    const dOut = out - p.label; // gradient of cross-entropy through the sigmoid
    g.b3 += dOut;
    for (let i = 0; i < H; i++) {
      g.w3[i] += dOut * h2[i];
      d2[i] = net.w3[i] * dOut * (1 - h2[i] * h2[i]);
    }
    for (let j = 0; j < H; j++) d1[j] = 0;
    for (let i = 0; i < H; i++) {
      g.b2[i] += d2[i];
      for (let j = 0; j < H; j++) {
        g.w2[i * H + j] += d2[i] * h1[j];
        d1[j] += net.w2[i * H + j] * d2[i];
      }
    }
    for (let j = 0; j < H; j++) {
      const d = d1[j] * (1 - h1[j] * h1[j]);
      g.b1[j] += d;
      g.w1[j * 2] += d * p.x;
      g.w1[j * 2 + 1] += d * p.y;
    }
  }

  const step = lr / n;
  for (const key of ['w1', 'b1', 'w2', 'b2', 'w3']) {
    for (let i = 0; i < net[key].length; i++) net[key][i] -= step * g[key][i] + lr * decay * net[key][i];
  }
  net.b3 -= step * g.b3;
  return { loss: loss / n, accuracy: correct / n };
}

// Starter datasets, coordinates in [-1, 1].
export const presets = {
  Circle: () => Array.from({ length: 90 }, (_, i) => {
    const inner = i % 2 === 0;
    const r = inner ? Math.random() * 0.35 : 0.62 + Math.random() * 0.3;
    const a = Math.random() * Math.PI * 2;
    return { x: r * Math.cos(a), y: r * Math.sin(a), label: inner ? 1 : 0 };
  }),
  XOR: () => Array.from({ length: 80 }, () => {
    const x = Math.random() * 1.7 - 0.85, y = Math.random() * 1.7 - 0.85;
    return { x, y, label: x * y > 0 ? 1 : 0 };
  }),
  Moons: () => Array.from({ length: 90 }, (_, i) => {
    const top = i % 2 === 0;
    const a = Math.random() * Math.PI;
    const n = () => (Math.random() - 0.5) * 0.14;
    return top
      ? { x: Math.cos(a) * 0.6 - 0.25 + n(), y: Math.sin(a) * 0.6 - 0.15 + n(), label: 1 }
      : { x: 0.25 - Math.cos(a) * 0.6 + n(), y: 0.2 - Math.sin(a) * 0.6 + n(), label: 0 };
  }),
  Split: () => Array.from({ length: 70 }, (_, i) => {
    const one = i % 2 === 0;
    return { x: (one ? -0.45 : 0.45) + (Math.random() - 0.5) * 0.6, y: (Math.random() - 0.5) * 1.5, label: one ? 1 : 0 };
  }),
};
