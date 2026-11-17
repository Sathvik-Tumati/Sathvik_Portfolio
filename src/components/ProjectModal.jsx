import { useEffect, useRef } from 'react';
import ProjectMedia from './ProjectMedia';
import { projects } from '../data/projects';

const pad = (n) => String(n).padStart(2, '0');

// Case study in a native <dialog> sheet: focus trap, Esc and backdrop come from the platform.
export default function ProjectModal({ project, onClose, onOpen }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (project && !dialog.open) dialog.showModal();
    if (project) dialog.scrollTop = 0;
    if (!project && dialog.open) dialog.close();
  }, [project]);

  const i = project ? projects.indexOf(project) : -1;
  const next = projects[(i + 1) % projects.length];

  const whyBuilt = () => {
    const [before, after] = project.whyBuilt.split(project.whyBuiltHighlight);
    if (after === undefined) return project.whyBuilt;
    return (
      <>
        {before}
        <mark>{project.whyBuiltHighlight}</mark>
        {after}
      </>
    );
  };

  return (
    <dialog ref={ref} className="cs" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="cs-title">
      {project && (
        <article className="cs__in" key={project.id}>
          <div className="cs__bar">
            <span className="label">
              Case study {pad(i + 1)} / {pad(projects.length)}
            </span>
            <button className="cs__close" onClick={onClose} aria-label="Close case study">
              Close <kbd>esc</kbd>
            </button>
          </div>

          <header className="cs__head">
            <p className="label label--signal">{project.liveUrl ? '● Live' : project.status}</p>
            <h2 id="cs-title">{project.name}</h2>
            <p className="cs__thesis">{project.thesis}</p>
          </header>

          <figure className="frame">
            <ProjectMedia project={project} />
          </figure>

          <dl className="cs__meta">
            <div>
              <dt className="label">Result</dt>
              <dd className="signal">{project.result}</dd>
            </div>
            <div>
              <dt className="label">Stack</dt>
              <dd className="mono">{project.tech.join(' · ')}</dd>
            </div>
            {(project.liveUrl || project.githubUrl) && (
              <div>
                <dt className="label">Links</dt>
                <dd className="cs__links">
                  {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live app ↗</a>}
                  {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                </dd>
              </div>
            )}
          </dl>

          <section className="cs__sec">
            <h3 className="label">Problem</h3>
            <p>{project.problem}</p>
          </section>
          <section className="cs__sec">
            <h3 className="label">Why I built it</h3>
            <p>{whyBuilt()}</p>
          </section>
          <section className="cs__sec">
            <h3 className="label">Pipeline</h3>
            <ol className="flow">
              {project.architecture.split(' → ').map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
          <section className="cs__sec">
            <h3 className="label">What it does</h3>
            <ul className="ticks">
              {project.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </section>
          <section className="cs__sec">
            <h3 className="label">What was hard</h3>
            <p>{project.challenges}</p>
          </section>
          <section className="cs__sec cs__sec--quote">
            <h3 className="label">Takeaway</h3>
            <blockquote>{project.learned}</blockquote>
          </section>

          <button className="cs__next" onClick={() => onOpen(next)}>
            <span className="label">Next case study</span>
            <span className="cs__next-name">{next.name} →</span>
          </button>
        </article>
      )}
    </dialog>
  );
}
