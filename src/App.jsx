import { useEffect, useState } from 'react';
import { Reveal, CountUp, Clock, Words } from './components/fx';
import { Backdrop, HeroField, Lab } from './components/Field';
import ProjectMedia from './components/ProjectMedia';
import ProjectModal from './components/ProjectModal';
import { projects } from './data/projects';
import { experience } from './data/experience';

const RESUME = '/Sathvik_Tumati_Resume.pdf';
const EMAIL = 'sats.tumati@gmail.com';
const pad = (n) => String(n).padStart(2, '0');

const sections = [
  ['about', 'About'],
  ['work', 'Work'],
  ['career', 'Experience'],
  ['lab', 'Lab'],
  ['stack', 'Skills'],
  ['contact', 'Contact'],
];

// Old multi-page URLs land on the matching section.
const legacy = { projects: 'work', about: 'about', skills: 'stack', education: 'career', contact: 'contact' };

const metrics = [
  { to: 99, unit: '%', label: 'Sensitivity', sub: 'Sleep apnea model at LifeSigns, interim results' },
  { to: 2, label: 'Live apps', sub: 'CivicPulse and EpiCast, deployed on Render' },
  { to: 2, label: 'Shortlists', sub: 'Google Solution Challenge 2026, Hackcelerate 2025' },
  { to: 7, label: 'Team members led', sub: 'AI/ML team, SU Knowledge Hub' },
];

// Tools that appear in at least one project's stack, so each row of the matrix is backed by work.
const stackGroups = [
  ['AI / ML', ['Python', 'Gemini API', 'LangGraph', 'LangChain', 'MCP', 'XGBoost', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Pandas', 'NumPy']],
  ['Backend', ['FastAPI', 'Firestore', 'SQLite', 'SQLAlchemy', 'WebSockets', 'Firebase Auth', 'AWS S3']],
  ['Interface', ['React', 'Next.js', 'TypeScript', 'Leaflet', 'Chart.js', 'Streamlit']],
].map(([group, tools]) => [
  group,
  tools
    .map((tool) => ({ tool, used: projects.map((p) => p.tech.includes(tool)) }))
    .map((row) => ({ ...row, n: row.used.filter(Boolean).length }))
    .sort((a, b) => b.n - a.n),
]);
const alsoUsed = 'Prompt engineering · Keras · Signal processing · Feature engineering · PostgreSQL · REST APIs · Git · Render · Vercel · JavaScript · SQL · Java · C / C++';

const years = ['2026', '2025', '2024'];

const education = [
  ['2023 – 27', 'B.E. Computer Science & AI', 'Muffakham Jah College of Engineering and Technology', 'GPA 8.0'],
  ['2021 – 23', 'Intermediate (XII)', 'FIITJEE Junior College, Saifabad', '78%'],
  ['2009 – 21', 'SSC (X)', 'FIITJEE World School, Ameerpet', 'GPA 10'],
];

const recognition = [
  ['2026', 'Google Solution Challenge', 'CivicPulse shortlisted'],
  ['2025', 'Hackcelerate', 'Memory Bridge shortlisted'],
  ['2026', 'Machine Learning', 'Columbia+ certification'],
  ['2026', 'Data Visualisation', 'Forage certification'],
];

// Which section is in the middle of the screen.
function useActiveSection() {
  const [active, setActive] = useState('top');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ['top', ...sections.map(([id]) => id)].forEach((id) => io.observe(document.getElementById(id)));
    return () => io.disconnect();
  }, []);
  return active;
}

// The URL hash names an open case study (/#civicpulse); section links use it too.
function useHash() {
  const [hash, setHash] = useState(() => location.hash.slice(1));
  useEffect(() => {
    const sync = () => setHash(location.hash.slice(1));
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);
  return [hash, setHash];
}

function Head({ no, label, children, aside }) {
  return (
    <Reveal className="shead">
      <p className="shead__no label">
        <b>{no}</b> {label}
      </p>
      <h2 className="shead__title"><Words>{children}</Words></h2>
      {aside && <p className="shead__aside">{aside}</p>}
    </Reveal>
  );
}

export default function App() {
  const [hash, setHash] = useHash();
  const active = useActiveSection();
  const selected = projects.find((p) => p.id === hash) || null;

  const open = (p) => {
    history[selected ? 'replaceState' : 'pushState'](null, '', `#${p.id}`);
    setHash(p.id);
  };
  const close = () => {
    history.replaceState(null, '', location.pathname);
    setHash('');
  };

  // Legacy paths (/projects#civicpulse, /skills) and deep links to a section.
  useEffect(() => {
    const path = location.pathname.replace(/^\/|\/$/g, '');
    if (path) {
      const target = location.hash || (legacy[path] ? `#${legacy[path]}` : '');
      history.replaceState(null, '', `/${target}`);
      setHash(target.slice(1));
    }
    const id = location.hash.slice(1);
    if (id && !projects.some((p) => p.id === id)) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, [setHash]);

  const featured = projects.slice(0, 3);
  const more = projects.slice(3);

  return (
    <>
      <a className="skip" href="#about">Skip to content</a>
      <Backdrop />

      <header className="head">
        <div className="wrap head__in">
          <a href="#top" className="brand" aria-label="Sathvik Tumati, back to top">
            <i aria-hidden="true" />
            Sathvik Tumati
          </a>
          <nav className="nav" aria-label="Sections">
            {sections.map(([id, label], i) => (
              <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
                <span>{pad(i + 1)}</span>
                {label}
              </a>
            ))}
          </nav>
          <a className="btn btn--sm" href={RESUME} target="_blank" rel="noopener noreferrer">
            Résumé
          </a>
        </div>
      </header>

      <main id="main">
        {/* ============ HERO ============ */}
        <section className="hero" id="top">
          <HeroField />
          <div className="wrap hero__in">
            <p className="hero__meta label">
              <span>AI / ML Engineer</span>
              <span>Hyderabad, India</span>
              <span className="status"><i /> Graduating 2027 · open to internships &amp; new-grad roles</span>
            </p>

            <h1 className="hero__name" aria-label="Sathvik Tumati">
              <span className="line"><span>Sathvik</span></span>
              <span className="line"><span>Tumati</span></span>
            </h1>

            <div className="hero__foot">
              <div>
                <p className="hero__thesis">
                  I build LLM systems and ML pipelines: <em>the part that has to work</em> when
                  someone is depending on it.
                </p>
                <ul className="hero__proof" aria-label="Highlights">
                  <li><b>ML Engineer Intern</b> at LifeSigns, 2026</li>
                  <li><b>99% sensitivity</b> sleep apnea model</li>
                  <li><b>2 live apps</b> · 2 hackathon shortlists</li>
                </ul>
              </div>
              <div className="hero__cta">
                <a href="#work" className="btn btn--solid">Selected work <span aria-hidden="true">↓</span></a>
                <a href={RESUME} className="btn" target="_blank" rel="noopener noreferrer">Résumé (PDF) <span aria-hidden="true">↗</span></a>
              </div>
            </div>

            <p className="hero__fig label">
              <b>Live demo</b> A neural network I wrote from scratch, training in your browser right
              now. The bright line is where it decides between two classes. Point anywhere to probe it.
            </p>
          </div>
        </section>

        {/* ============ 01 ABOUT ============ */}
        <section className="section wrap" id="about">
          <Head no="01" label="About">
            Engineer first. <em>AI is the layer, not the product.</em>
          </Head>

          <div className="about">
            <Reveal as="figure" className="portrait">
              <img src="/images/portrait-hero.jpg" alt="Sathvik Tumati" width="1200" height="1600" loading="lazy" />
              <figcaption className="label">Sathvik Tumati, Hyderabad.</figcaption>
            </Reveal>

            <div className="about__text">
              <Reveal as="p" className="statement">
                I’m a Computer Science &amp; AI student at MJCET, class of 2027, building LLM
                applications, ML pipelines, and the backends they run on.
              </Reveal>
              <Reveal as="p" className="prose" delay={80}>
                Most recently I was a Machine Learning Engineer Intern at LifeSigns, working on
                sleep apnea detection from wearable sensor data. Most of my projects start with a
                question I can’t leave alone, usually about what happens when a system fails the
                people depending on it.
              </Reveal>

              <Reveal as="dl" className="card" delay={160}>
                <div><dt>Role</dt><dd>AI / ML Engineer</dd></div>
                <div><dt>Most recent</dt><dd>ML Engineer Intern, LifeSigns · Jun – Nov 2026</dd></div>
                <div><dt>Education</dt><dd>B.E. CS &amp; AI, MJCET · graduating 2027 · GPA 8.0</dd></div>
                <div><dt>Focus</dt><dd>LLM pipelines, tool-using agents, applied ML, FastAPI backends</dd></div>
                <div><dt>Core skills</dt><dd>Python · Gemini API · LangGraph · LangChain · MCP · XGBoost · TensorFlow · Scikit-learn · OpenCV · FastAPI · React · SQL</dd></div>
                <div><dt>Languages</dt><dd>English, Hindi, Telugu</dd></div>
                <div><dt>Status</dt><dd className="signal">Open to internships and 2027 new-grad roles</dd></div>
              </Reveal>
            </div>
          </div>

          <dl className="metrics" aria-label="Results at a glance">
            {metrics.map((m, i) => (
              <Reveal key={m.label} className="metric" delay={i * 90}>
                <dt>
                  <CountUp to={m.to} />
                  {m.unit && <small>{m.unit}</small>}
                </dt>
                <dd>
                  <strong>{m.label}</strong>
                  {m.sub}
                </dd>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* ============ 02 WORK ============ */}
        <section className="section wrap" id="work">
          <Head
            no="02"
            label="Selected work"
            aside="Every project opens into a case study: the problem, the pipeline, what was hard, and what I’d keep."
          >
            Seven projects, <em>from notebook to production.</em>
          </Head>

          <ol className="entries">
            {featured.map((p, i) => (
              <Reveal as="li" key={p.id} className="entry">
                <button className="entry__media frame" onClick={() => open(p)} aria-label={`Open the ${p.name} case study`}>
                  <ProjectMedia project={p} />
                  <span className="entry__open label">Read case study →</span>
                </button>

                <div className="entry__body">
                  <p className="entry__no label">
                    <b>{pad(i + 1)}</b> {p.liveUrl ? <span className="signal">● Live</span> : p.status}
                  </p>
                  <h3 className="entry__name">
                    <button onClick={() => open(p)}>{p.name}</button>
                  </h3>
                  <p className="entry__thesis">{p.thesis}</p>
                  <p className="entry__result">{p.result}</p>

                  <ol className="pipe" aria-label="Pipeline">
                    {p.architecture.split(' → ').map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>

                  <p className="entry__links">
                    <button className="link" onClick={() => open(p)}>Case study →</button>
                    {p.liveUrl && <a className="link" href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live ↗</a>}
                    {p.githubUrl && <a className="link" href={p.githubUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="index">
            <p className="label index__title">Also built</p>
            <ol>
              {more.map((p, i) => (
                <li key={p.id}>
                  <button onClick={() => open(p)}>
                    <span className="index__no">{pad(i + 4)}</span>
                    <span className="index__name">{p.name}</span>
                    <span className="index__thesis">{p.thesis}</span>
                    <span className="index__result">{p.result}</span>
                    <span className="index__go" aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* ============ 03 EXPERIENCE ============ */}
        <section className="section wrap" id="career">
          <Head no="03" label="Experience">
            Where I’ve <em>put in the hours.</em>
          </Head>

          <ol className="log">
            {experience.map((e, i) => (
              <Reveal as="li" key={e.role} className="log__row">
                <span className="log__year">{years[i]}</span>
                <div className="log__head">
                  <h3>{e.role}</h3>
                  <p className="mono">{e.org} · {e.period}</p>
                </div>
                <p className="log__desc">{e.desc}</p>
              </Reveal>
            ))}
          </ol>

          <div className="duo">
            <Reveal>
              <h3 className="label duo__title">Education</h3>
              <ul className="rows">
                {education.map(([yrs, course, school, score]) => (
                  <li key={course}>
                    <span className="mono">{yrs}</span>
                    <span>{course}<small>{school}</small></span>
                    <b className="mono">{score}</b>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <h3 className="label duo__title">Recognition</h3>
              <ul className="rows">
                {recognition.map(([year, title, note]) => (
                  <li key={title}>
                    <span className="mono">{year}</span>
                    <span>{title}<small>{note}</small></span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="aside-card">
            <p className="label">Off the clock</p>
            <p>
              <strong>Radio Jockey, All India Radio.</strong> I host on the Yuvavani programme at
              Aakashvani Hyderabad. It’s where I learned that a technical idea only matters once
              someone else understands it.
            </p>
          </Reveal>
        </section>

        {/* ============ 04 LAB ============ */}
        <section className="section section--lab" id="lab">
          <div className="wrap">
            <Head
              no="04"
              label="Lab: try it"
              aside="Two inputs, two hidden layers of eight tanh units, one sigmoid output, trained with full-batch gradient descent I wrote by hand. No libraries, about ninety lines. Shading shows how confident it is; the bright line is where it is 50/50."
            >
              Don’t take my word for it. <em>Train one.</em>
            </Head>
            <Reveal>
              <Lab />
            </Reveal>
          </div>
        </section>

        {/* ============ 05 SKILLS ============ */}
        <section className="section wrap" id="stack">
          <Head
            no="05"
            label="Skills"
            aside="Each row is a tool, each column a project. A mark means the tool shipped in that project, so nothing here is a keyword without a build behind it."
          >
            Every skill, <em>matched to the project that used it.</em>
          </Head>

          <Reveal className="matrix">
            <table>
              <thead>
                <tr>
                  <th scope="col" className="matrix__corner label">Tool</th>
                  {projects.map((p, i) => (
                    <th scope="col" key={p.id}>
                      <button onClick={() => open(p)} title={`Open ${p.name}`}>
                        <span className="matrix__pno">{pad(i + 1)}</span>
                        <span className="matrix__pname">{p.name}</span>
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="matrix__n label">Used</th>
                </tr>
              </thead>
              {stackGroups.map(([group, rows], g) => (
                <tbody key={group}>
                  <tr className="matrix__group">
                    <th scope="rowgroup" colSpan={projects.length + 2} className="label">{group}</th>
                  </tr>
                  {rows.map((row, j) => (
                    <tr key={row.tool} style={{ '--r': g * 4 + j }}>
                      <th scope="row">{row.tool}</th>
                      {row.used.map((on, i) => (
                        <td key={projects[i].id}>
                          {on ? <i className="mark" aria-label="used" /> : <span className="sr">not used</span>}
                        </td>
                      ))}
                      <td className="matrix__n mono">{row.n}/{projects.length}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
            <p className="label matrix__hint">Swipe the table for every project →</p>
          </Reveal>
          <Reveal as="p" className="also">
            <span className="label">Also in the toolbox</span> {alsoUsed}
          </Reveal>
        </section>

        {/* ============ 06 CONTACT ============ */}
        <section className="section wrap contact" id="contact">
          <Reveal>
            <p className="label"><b>06</b> Contact</p>
            <h2 className="contact__title">
              <Words>Have something that <em>has to work?</em></Words>
            </h2>
            <a className="contact__mail" href={`mailto:${EMAIL}`}>
              {EMAIL} <span aria-hidden="true">↗</span>
            </a>
          </Reveal>

          <Reveal className="contact__grid" delay={100}>
            <div>
              <p className="label">Looking for</p>
              <p>AI / ML engineering internships and 2027 new-grad roles. Email is the fastest way to reach me.</p>
            </div>
            <div>
              <p className="label">Elsewhere</p>
              <a href="https://github.com/Sathvik-Tumati" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com/in/sathvik-tumati/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={RESUME} target="_blank" rel="noopener noreferrer">Résumé (PDF) ↗</a>
            </div>
            <div>
              <p className="label">Local time</p>
              <p className="mono"><Clock /></p>
              <p className="dim">Hyderabad, India</p>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© 2026 Sathvik Tumati</span>
        <span>Set in Geist &amp; Newsreader. The networks on this page are hand-written, about ninety lines.</span>
        <a href="#top">Back to top ↑</a>
      </footer>

      <ProjectModal project={selected} onClose={close} onOpen={open} />
    </>
  );
}
