import { useEffect, useRef, useState } from 'react';
import { createNet, predict, trainStep, presets } from '../lib/mlp';
import { contour } from '../lib/contours';

// Colours mirror the tokens in index.css.
const SIGNAL = '210, 244, 92';
const STEEL = '127, 156, 179';
const BONE = '236, 235, 228';
const INK = '#0b0c0a';
// Contours are drawn in log-odds, one line per unit, so they spread evenly
// instead of bunching where the network is confident. 0 is the decision boundary.
const LEVELS = Array.from({ length: 17 }, (_, i) => i - 8);
const fillCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const logit = (p) => Math.log(Math.max(p, 1e-7) / Math.max(1 - p, 1e-7));

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Calls `frame` every animation frame, only while the canvas is on screen.
function useVisibleLoop(ref, frame) {
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function fit(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

// view = { cx, cy, s }: pixel position of the origin and model units per pixel.
const toModel = (view, px, py) => [(px - view.cx) * view.s, (py - view.cy) * view.s];
const toPixel = (view, x, y) => [view.cx + x / view.s, view.cy + y / view.s];

// Draws what the network believes everywhere on the canvas: an optional heat fill,
// log-odds contours, and the decision boundary (p = 0.5) in signal.
function drawField(ctx, net, w, h, view, { cell, fill, alpha }) {
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const v = new Float32Array((cols + 1) * (rows + 1));
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const p = predict(net, ...toModel(view, c * cell, r * cell));
      v[r * (cols + 1) + c] = logit(p);
    }
  }

  ctx.clearRect(0, 0, w, h);
  if (fill) {
    // one pixel per sample, scaled up with smoothing so the shading has no seams
    const img = new ImageData(cols + 1, rows + 1);
    const [sr, sg, sb] = SIGNAL.split(',').map(Number), [tr, tg, tb] = STEEL.split(',').map(Number);
    v.forEach((l, i) => {
      const p = 1 / (1 + Math.exp(-l)), a = p > 0.5;
      img.data.set([a ? sr : tr, a ? sg : tg, a ? sb : tb, Math.abs(p - 0.5) * 2 * 50], i * 4);
    });
    fillCanvas.width = cols + 1;
    fillCanvas.height = rows + 1;
    fillCanvas.getContext('2d').putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fillCanvas, -cell / 2, -cell / 2, (cols + 1) * cell, (rows + 1) * cell);
  }

  for (const level of LEVELS) {
    const boundary = level === 0;
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of contour(v, cols, rows, level)) {
      ctx.moveTo(x1 * cell, y1 * cell);
      ctx.lineTo(x2 * cell, y2 * cell);
    }
    ctx.lineWidth = boundary ? 1.6 : 1;
    ctx.strokeStyle = boundary
      ? `rgba(${SIGNAL}, ${Math.min(1, alpha * 2.4)})`
      : `rgba(${level > 0 ? BONE : STEEL}, ${alpha * (0.3 + (Math.abs(level) / 8) * 0.5)})`;
    ctx.stroke();
  }
}

// Class 1 is a filled signal dot, class 0 a hollow steel ring.
function drawPoints(ctx, points, view, r, opacity = 1) {
  ctx.globalAlpha = opacity;
  for (const p of points) {
    const [x, y] = toPixel(view, p.x, p.y);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (p.label) {
      ctx.fillStyle = `rgb(${SIGNAL})`;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = INK;
      ctx.stroke();
    } else {
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgb(${STEEL})`;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------------ */
/* Hero: a network learning two moons while the data slowly turns, so  */
/* the landscape never stops moving. Pointing at it shows p(x, y).      */
/* ------------------------------------------------------------------ */

export function HeroField() {
  const canvas = useRef(null);
  const s = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!s.current) return;
      const r = canvas.current.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      s.current.probe = x >= 0 && y >= 0 && x <= r.width && y <= r.height ? [x, y] : null;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useVisibleLoop(canvas, () => {
    if (!s.current) {
      // a short warm start, so the first frame already bends and the rest of the fit is visible
      s.current = { net: createNet(), base: presets.Moons(), angle: 0, probe: null, settled: false };
      for (let i = 0; i < 700; i++) trainStep(s.current.net, s.current.base, 0.35, 0.006);
    }
    const st = s.current;
    const { ctx, w, h } = fit(canvas.current);
    const wide = w > 900;
    const view = { cx: wide ? w * 0.7 : w * 0.5, cy: h * (wide ? 0.44 : 0.36), s: 2 / (h * (wide ? 0.62 : 0.5)) };

    const calm = still();
    if (!calm) st.angle += 0.0012;
    const c = Math.cos(st.angle), sn = Math.sin(st.angle);
    const points = st.base.map((p) => ({ x: p.x * c - p.y * sn, y: p.x * sn + p.y * c, label: p.label }));
    const steps = calm ? (st.settled ? 0 : 2500) : 8;
    for (let i = 0; i < steps; i++) trainStep(st.net, points, 0.35, 0.006);
    st.settled = true;

    drawField(ctx, st.net, w, h, view, { cell: wide ? 12 : 10, fill: false, alpha: 0.5 });
    drawPoints(ctx, points, view, 2.4, 0.7);

    if (st.probe) {
      const [px, py] = st.probe;
      const p = predict(st.net, ...toModel(view, px, py));
      ctx.strokeStyle = `rgba(${BONE}, 0.22)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, 0); ctx.lineTo(px, h);
      ctx.moveTo(0, py); ctx.lineTo(w, py);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgb(${p > 0.5 ? SIGNAL : STEEL})`;
      ctx.stroke();
      ctx.font = "500 11px 'Geist Mono', ui-monospace, monospace";
      ctx.fillStyle = `rgb(${BONE})`;
      const flip = px > w - 150;
      ctx.textAlign = flip ? 'right' : 'left';
      ctx.fillText(`p(x,y) = ${p.toFixed(3)}`, px + (flip ? -12 : 12), py - 12);
      ctx.textAlign = 'left';
    }
  });

  return <canvas ref={canvas} className="hero__field" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Lab: the same network, trained on points the visitor places.        */
/* ------------------------------------------------------------------ */

export function Lab() {
  const canvas = useRef(null);
  const chart = useRef(null);
  const st = useRef(null);
  const epochOut = useRef(null);
  const lossOut = useRef(null);
  const accOut = useRef(null);
  const [label, setLabel] = useState(1);
  const [preset, setPreset] = useState('Circle');

  const reset = (points) => {
    st.current = { net: createNet(), points, epoch: 0, history: [] };
  };
  const load = (name) => {
    reset(name ? presets[name]() : []);
    setPreset(name);
  };

  useVisibleLoop(canvas, () => {
    if (!st.current) reset(presets.Circle());
    const s = st.current;
    const { ctx, w, h } = fit(canvas.current);
    const view = { cx: w / 2, cy: h / 2, s: 2.1 / h };

    const steps = still() ? (s.epoch < 2000 ? 2000 : 0) : 12;
    let result = null;
    for (let i = 0; i < steps; i++) {
      result = trainStep(s.net, s.points, 0.5, 0.002);
      s.epoch++;
    }
    if (result && s.points.length) {
      s.history.push(result.loss);
      if (s.history.length > 260) s.history.shift();
      epochOut.current.textContent = s.epoch.toLocaleString('en');
      lossOut.current.textContent = result.loss.toFixed(3);
      accOut.current.textContent = `${Math.round(result.accuracy * 100)}%`;
    } else if (!s.points.length) {
      epochOut.current.textContent = '0';
      lossOut.current.textContent = '—';
      accOut.current.textContent = '—';
    }

    drawField(ctx, s.net, w, h, view, { cell: 8, fill: true, alpha: 0.6 });
    drawPoints(ctx, s.points, view, 4.5);

    // loss curve
    const c = fit(chart.current);
    c.ctx.clearRect(0, 0, c.w, c.h);
    if (s.history.length > 1) {
      const max = Math.max(...s.history, 0.0001);
      c.ctx.beginPath();
      s.history.forEach((l, i) => {
        const x = (i / 259) * c.w, y = c.h - 2 - (l / max) * (c.h - 6);
        if (i) c.ctx.lineTo(x, y);
        else c.ctx.moveTo(x, y);
      });
      c.ctx.lineWidth = 1.4;
      c.ctx.strokeStyle = `rgb(${SIGNAL})`;
      c.ctx.stroke();
    }
  });

  const addPoint = (e) => {
    const r = canvas.current.getBoundingClientRect();
    const [x, y] = toModel({ cx: r.width / 2, cy: r.height / 2, s: 2.1 / r.height }, e.clientX - r.left, e.clientY - r.top);
    st.current.points.push({ x, y, label: e.shiftKey ? 1 - label : label });
    if (still()) st.current.epoch = 0; // retrain once
  };

  return (
    <div className="lab">
      <figure className="lab__stage">
        <canvas
          ref={canvas}
          className="lab__canvas"
          onClick={addPoint}
          role="img"
          aria-label="Decision landscape of a neural network training live. Click to add a training point."
        />
        <figcaption className="lab__readout">
          <span>epoch <b ref={epochOut}>0</b></span>
          <span>loss <b ref={lossOut}>—</b></span>
          <span>train acc <b ref={accOut}>—</b></span>
        </figcaption>
      </figure>

      <div className="lab__side">
        <div className="lab__group">
          <span className="label">1 · Pick a class, then click the canvas</span>
          <div className="seg">
            <button className={label === 1 ? 'is-on' : undefined} onClick={() => setLabel(1)} aria-pressed={label === 1}>
              <i className="dot dot--a" /> Class A
            </button>
            <button className={label === 0 ? 'is-on' : undefined} onClick={() => setLabel(0)} aria-pressed={label === 0}>
              <i className="dot dot--b" /> Class B
            </button>
          </div>
        </div>

        <div className="lab__group">
          <span className="label">2 · Or load a dataset</span>
          <div className="seg">
            {Object.keys(presets).map((name) => (
              <button key={name} className={preset === name ? 'is-on' : undefined} onClick={() => load(name)} aria-pressed={preset === name}>
                {name}
              </button>
            ))}
            <button onClick={() => load(null)}>Clear</button>
          </div>
        </div>

        <div className="lab__group">
          <span className="label">Training loss</span>
          <canvas ref={chart} className="lab__chart" aria-hidden="true" />
          <button className="link" onClick={() => reset(st.current.points)}>Re-initialise weights ↺</button>
        </div>

        <p className="lab__note">
          Load <em>Circle</em>, then drop Class B points in the middle and watch it
          change its mind. Shift-click places the other class.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Backdrop: a faint contour map behind the whole page that drifts     */
/* slower than the content as you scroll, plus a soft pointer light.   */
/* It fades in once the hero (which has its own field) is left behind. */
/* ------------------------------------------------------------------ */

// A smooth, hilly field. Units: one "unit" is roughly 260px on screen.
const terrain = (x, y) =>
  Math.sin(x * 1.3 + Math.sin(y * 0.9) * 1.2) + Math.cos(y * 1.1 - x * 0.4) * 0.8 + Math.sin((x + y) * 0.55) * 0.6;
const TERRAIN_LEVELS = Array.from({ length: 15 }, (_, i) => -2.1 + i * 0.3);

export function Backdrop() {
  const canvas = useRef(null);
  const light = useRef(null);

  useEffect(() => {
    const calm = still();
    let raf = 0;
    const draw = () => {
      raf = 0;
      const { ctx, w, h } = fit(canvas.current);
      const fade = Math.min(1, Math.max(0, (scrollY - h * 0.35) / (h * 0.5)));
      canvas.current.style.opacity = fade;
      ctx.clearRect(0, 0, w, h);
      if (!fade) return;

      const cell = 18, k = 1 / 260, drift = calm ? 0 : scrollY * 0.3;
      const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
      const v = new Float32Array((cols + 1) * (rows + 1));
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) v[r * (cols + 1) + c] = terrain(c * cell * k, (r * cell + drift) * k);
      }
      TERRAIN_LEVELS.forEach((level, i) => {
        ctx.beginPath();
        for (const [x1, y1, x2, y2] of contour(v, cols, rows, level)) {
          ctx.moveTo(x1 * cell, y1 * cell);
          ctx.lineTo(x2 * cell, y2 * cell);
        }
        // every fifth line is an "index contour", a little stronger, as on a survey map
        ctx.strokeStyle = `rgba(${BONE}, ${i % 5 === 2 ? 0.11 : 0.05})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };
    const schedule = () => (raf ||= requestAnimationFrame(draw));
    const onPointer = (e) => {
      light.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      light.current.style.opacity = 1;
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    if (!calm) window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvas} />
      <i ref={light} className="backdrop__light" />
    </div>
  );
}
