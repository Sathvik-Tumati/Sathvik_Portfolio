// Marching squares. `v` holds (cols + 1) * (rows + 1) samples, row by row.
// Returns line segments [x1, y1, x2, y2] in grid units where the field crosses `level`.

// Edges: 0 top, 1 right, 2 bottom, 3 left. Index = tl*8 + tr*4 + br*2 + bl.
const CASES = [
  [], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
  [[3, 0]], [[0, 2]], [[3, 2], [0, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], [],
];

export function contour(v, cols, rows, level) {
  const out = [];
  const at = (c, r) => v[r * (cols + 1) + c];
  const t = (a, b) => (level - a) / (b - a || 1e-9);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tl = at(c, r), tr = at(c + 1, r), br = at(c + 1, r + 1), bl = at(c, r + 1);
      const segs = CASES[(tl > level) * 8 + (tr > level) * 4 + (br > level) * 2 + (bl > level)];
      if (!segs.length) continue;
      const edge = (e) =>
        e === 0 ? [c + t(tl, tr), r]
        : e === 1 ? [c + 1, r + t(tr, br)]
        : e === 2 ? [c + t(bl, br), r + 1]
        : [c, r + t(tl, bl)];
      for (const [a, b] of segs) out.push([...edge(a), ...edge(b)]);
    }
  }
  return out;
}
