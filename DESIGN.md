# Design System — Sathvik Tumati Portfolio

## Product Context
- **What this is:** Personal portfolio and case studies for an AI/ML engineer.
- **Who it's for:** Recruiters, engineering leads and fellow engineers screening for applied-AI, ML and backend roles.
- **The one thing to remember:** "This person understands models, ships systems, and has taste."

## Concept: field notes
v5 (2026-11-17) is built like a technical paper rather than a portfolio template. Sections are numbered, the type and rules are set like a paper, and the About block reads like a model card. The signature is a neural network's belief drawn as a **topographic map**: log-odds contour lines with the decision boundary in the signal colour. It appears twice: as the hero background and as the interactive Lab.

History (do not repeat):
- v1 near-black + amber, Playfair italics. v2 bare light document ("just data on white pages"). v3 black + red, block capitals, ECG ("crime scene"). v4 warm espresso + brass editorial with preloader, custom cursor, horizontal gallery and a force graph. The owner asked for a full rethink, not a variation.

## Typography
- **Sans (display and body):** Geist. Display 450–500, tracking −0.045 to −0.06em, tight leading (0.84 for the hero name). Body 17px / 1.6.
- **Serif accent:** Newsreader italic 300, only inside `<em>` for the emphasised half of a headline, project theses and takeaways.
- **Mono (labels, data, pipelines):** Geist Mono. Labels are 11.5px uppercase with 0.08em tracking.

## Colour
Tokens live on `:root` in `src/index.css`; `Field.jsx` mirrors the three canvas colours.
- **Ink:** `#0b0c0a` canvas · `#111310` raised (Lab band, case-study sheet) · `#181a16` hover.
- **Bone text:** `#ecebe4` · dim `#a6a69c` · faint `#7a7b72`. Rules are bone at 10% and 20%.
- **Signal:** `#d2f45c` (chartreuse). Use it only for the decision boundary, class A, results, section numbers, the status dot, matrix marks and the primary button.
- **Steel:** `#7f9cb3`. Used for class B and the low side of the contours. Never as a UI accent.
- **Never:** purple/blue gradients, glow, glass cards, red or orange.

## Layout
- 12-column grid, max 1440px, gutter `clamp(16px, 4vw, 56px)`.
- Section head: the § label in columns 1–3, the headline in 4–12.
- Radius: 999px for buttons and chips, 4px for frames. 1px rules carry the structure; there are no cards with shadows.

## The page
Order and labels were set after a recruiter-perspective review (2026-11-17): proof above the fold, experience straight after the work, and plain labels. The paper look stays in the visuals, not in the wording.
1. **Hero:** giant name. Status line ("Graduating 2027 · open to internships & new-grad roles"), the thesis, a three-item proof list (LifeSigns internship, the 99% sensitivity model, live apps and shortlists), then Selected work and Résumé. Behind it, the live network fits two rotating moons; the pointer probes p(x, y). A "Live demo" caption sits top-right.
2. **01 About:** portrait (full colour, owner preference), a statement, a profile card with a **Core skills** row for keyword scanning, and four count-up metrics.
3. **02 Selected work:** the first three projects as large entries (media, thesis, result, inline pipeline), the other four as an index. Everything opens the case study.
4. **03 Experience:** a log with oversized years, education and recognition, then radio as "off the clock". The section id stays `career` so old links keep working.
5. **04 Lab:** the interactive network for engineers who want to play.
6. **05 Skills:** the tool × project matrix computed from `projects[].tech`.
7. **06 Contact:** a giant question, the email, links and local time.

Copy rules: plain section names; no jargon a non-technical screener would trip on ("log-odds", "abstract", "correspondence"); never upgrade a fact (e.g. "Team members led", not "Engineers led").

**Case study:** a native `<dialog>` sheet from the right, opened by `/#<project-id>`. It has a sticky bar, meta row, numbered pipeline, and a "next case study" link at the end.

## Background (2026-11-17, after "the completely black background is boring")
- `Backdrop` in `Field.jsx`: a fixed survey-map of contour lines behind the page. Every fifth line is a stronger "index contour". It drifts at 0.3× scroll speed for depth and fades in after the hero.
- A soft chartreuse/steel light follows the pointer. Two faint corner pools (steel bottom-left, signal top-right) and SVG film grain sit on top.
- The Lab band is graph paper (a 32px grid on raised ink).
- `body` must stay transparent: the backdrop is `z-index: -1` and `html` carries the ink colour.

## Motion
- Expo-out easing (`cubic-bezier(0.16, 1, 0.3, 1)`). The hero name rises line by line and metrics count up once.
- Section headlines rise **word by word** through masks (`<Words>` in `fx.jsx`). Other blocks rise once, quickly (0.6–0.8s, no blur), so a fast skim never meets empty space.
- Screenshots and the portrait **wipe in** from the top and settle from a 14% zoom. Stack marks pop in row by row.
- Scroll-driven, where supported: the hero type lifts and fades as you leave it, the hero field sinks, and a signal progress line runs under the header.
- Case study: the sheet slides in, its content cascades, and it replays on "next".
- Hovers: link underlines sweep to signal, outline buttons fill from below, and index rows get a sweep.
- The canvases animate only while on screen (IntersectionObserver).
- `prefers-reduced-motion`: CSS motion is off. The networks train to convergence once and stay still.
- Not used: preloader, custom cursor, magnetic buttons, scroll-jacking, parallax, particles.

## Implementation
- React 19 + Vite, with no router and no animation library. The hash drives the case study (`useHash` in `App.jsx`). Old paths (`/projects`, `/skills`, …) redirect to their sections.
- `src/lib/mlp.js` is the network and `src/lib/contours.js` is marching squares. `node src/lib/mlp.check.mjs` checks both.
