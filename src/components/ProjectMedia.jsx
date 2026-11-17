// The picture for a project: a real screenshot when there is one, otherwise a
// small animated diagram, drawn in the site's colours, of what the system does.

const ACCENT = '#d2f45c';
const CREAM = '#ecebe4';

const visuals = {
  // ECG over a respiration trace, with the breathing pause the model looks for.
  'sleep-apnea': (
    <>
      <path
        className="pv-trace"
        d="M0 46 H22 l5 -5 5 5 h8 l4 7 6 -40 6 48 4 -15 h10 l7 -8 7 8 H112 l5 -5 5 5 h8 l4 7 6 -40 6 48 4 -15 h10 l7 -8 7 8 H202 l5 -5 5 5 h8 l4 7 6 -40 6 48 4 -15 h10 l7 -8 7 8 H320"
        stroke={ACCENT}
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M0 142 q10 -22 20 0 t20 0 t20 0 t20 0 t20 0 h88 q10 -22 20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
        stroke={CREAM}
        strokeOpacity="0.75"
        strokeWidth="1.2"
        fill="none"
      />
      <rect x="100" y="112" width="88" height="48" fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} strokeDasharray="3 3" />
      <text x="12" y="20">ECG</text>
      <text x="12" y="106">RESPIRATION</text>
      <text className="hot pv-blink" x="104" y="176">APNEA EVENT FLAGGED</text>
    </>
  ),

  // An agent calling three tools.
  'learning-path-mcp': (
    <>
      {[[64, 44, 'YOUTUBE'], [256, 44, 'DRIVE'], [160, 172, 'NOTION']].map(([x, y, label], i) => (
        <g key={label}>
          <line x1="160" y1="104" x2={x} y2={y} stroke={CREAM} strokeOpacity="0.3" />
          <circle r="3" fill={ACCENT}>
            <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={`M160 104 L${x} ${y}`} />
          </circle>
          <rect x={x - 34} y={y - 11} width="68" height="22" fill="#131512" stroke={CREAM} strokeOpacity="0.45" />
          <text x={x} y={y + 3} textAnchor="middle">{label}</text>
        </g>
      ))}
      <rect x="118" y="88" width="84" height="32" fill={ACCENT} />
      <text x="160" y="107" textAnchor="middle" style={{ fill: '#0b0c0a', fontWeight: 600 }}>AGENT · MCP</text>
    </>
  ),

  // A face being found and matched.
  'memory-bridge': (
    <>
      <ellipse cx="160" cy="92" rx="38" ry="48" fill="none" stroke={CREAM} strokeOpacity="0.5" />
      <path d="M144 84 h10 M166 84 h10 M148 112 q12 9 24 0" stroke={CREAM} strokeOpacity="0.5" fill="none" />
      <path d="M108 30 h-14 v14 M212 30 h14 v14 M108 154 h-14 v-14 M212 154 h14 v-14" stroke={ACCENT} strokeWidth="2" fill="none" />
      <line className="pv-scan" x1="94" y1="48" x2="226" y2="48" stroke={ACCENT} strokeOpacity="0.8" />
      <text className="hot pv-blink" x="160" y="180" textAnchor="middle">RECOGNISED</text>
    </>
  ),

  // Ink-density map of an answer sheet with one flagged region.
  'integrity-forensics': (
    <>
      {Array.from({ length: 6 * 10 }, (_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const flagged = row === 3 && (col === 6 || col === 7);
        return (
          <rect
            key={i}
            x={40 + col * 24}
            y={28 + row * 24}
            width="20"
            height="20"
            fill={flagged ? ACCENT : CREAM}
            fillOpacity={flagged ? 0.9 : 0.06 + (((col * 7 + row * 13) % 9) / 9) * 0.22}
            className={flagged ? 'pv-blink' : undefined}
          />
        );
      })}
      <text x="40" y="20">INK DENSITY</text>
      <text className="hot" x="184" y="186">FLAGGED FOR REVIEW</text>
    </>
  ),

  // Class probabilities.
  'dog-breed-classifier': (
    <>
      <text x="28" y="26">120 CLASSES · TOP PREDICTIONS</text>
      {[['GOLDEN RETRIEVER', 216], ['LABRADOR', 92], ['KUVASZ', 48], ['GREAT PYRENEES', 30]].map(([label, w], i) => (
        <g key={label}>
          <text x="28" y={58 + i * 36}>{label}</text>
          <rect
            className="pv-bar"
            x="28"
            y={64 + i * 36}
            width={w}
            height="10"
            fill={i === 0 ? ACCENT : CREAM}
            fillOpacity={i === 0 ? 1 : 0.35}
            style={{ animationDelay: `${i * 120}ms` }}
          />
        </g>
      ))}
    </>
  ),
};

export default function ProjectMedia({ project }) {
  if (project.image) {
    return (
      <img
        src={project.image}
        alt={`Screenshot of ${project.name}`}
        width="1200"
        height="750"
        loading="lazy"
      />
    );
  }
  return (
    <svg className="pv" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Diagram of ${project.name}`}>
      {visuals[project.id]}
    </svg>
  );
}
