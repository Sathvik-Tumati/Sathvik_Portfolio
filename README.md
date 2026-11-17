# Sathvik Tumati — Portfolio

Single-page portfolio: React 19 + Vite, plain CSS in `src/index.css`, no router or animation library.
The visual system is documented in `DESIGN.md`; read it before changing how anything looks. Live at
https://sathvik-portfolio-mu.vercel.app.

## Develop

```bash
npm install
npm run dev                  # local dev server
npm run lint
npm run build                # production build in dist/
node src/lib/mlp.check.mjs   # the network still learns, the contour tracer still works
```

## Content

- `src/data/projects.js` — every project and case study. The first three are the large entries in
  Selected work; the rest form the index. `tech` also drives the Stack matrix. A case study can be
  linked directly: `/#civicpulse` (the older `/projects#civicpulse` still works).
- `src/data/experience.js` — the career log.
- `src/App.jsx` — the whole page, section by section (`#about`, `#work`, `#lab`, `#stack`, `#career`, `#contact`).
- `src/components/Field.jsx` — the hero landscape and the Lab, built on `src/lib/mlp.js` (hand-written
  network) and `src/lib/contours.js` (marching squares).
- `src/components/ProjectModal.jsx` — the case-study sheet. `ProjectMedia.jsx` draws a diagram when a
  project has no screenshot.
- `resume/resume.md` — résumé source. `sh resume/build.sh` rebuilds the PDF and copies it to `public/`.

## Deploy

Vercel, framework preset "Vite". `vercel.json` rewrites every path to `index.html`, so old page
URLs reach the app and are redirected to their sections. Pushing to `main` deploys.
