import { useState } from 'react';
import { useStore } from '../store.jsx';
import { CATEGORIES } from '../data/taxonomy.js';

// Simulated cohort so the report has shape in a demo. Live activity on this device is added on top.
const SIM = {
  students: 1240,
  saves: { tech: 1810, engineering: 940, business: 1320, creative: 1105, media: 430, service: 980, sports: 1215, culture: 520 },
  passes: { tech: 1530, engineering: 1210, business: 1460, creative: 900, media: 610, service: 870, sports: 990, culture: 640 },
  gaps: [
    { q: 'pickleball', n: 41 },
    { q: 'game dev club', n: 37 },
    { q: 'cooking with other students', n: 26 },
    { q: 'k-pop dance, beginners', n: 22 },
    { q: 'chess, casual', n: 15 },
  ],
};

export default function Insights() {
  const { state, clubs } = useStore();
  const [hover, setHover] = useState(null);

  const byId = Object.fromEntries(clubs.map((c) => [c.id, c]));
  const saves = { ...SIM.saves }, passes = { ...SIM.passes };
  for (const [id, d] of Object.entries(state.swipes)) {
    const cat = byId[id]?.category;
    if (!cat) continue;
    if (d === 'right') saves[cat] = (saves[cat] || 0) + 1; else passes[cat] = (passes[cat] || 0) + 1;
  }
  const rows = Object.keys(CATEGORIES).map((id) => ({ id, label: CATEGORIES[id].label, saves: saves[id], rate: saves[id] / (saves[id] + passes[id]) }))
    .sort((a, b) => b.saves - a.saves);
  const max = Math.max(...rows.map((r) => r.saves));

  const live = {};
  for (const s of state.searches.filter((x) => !x.strong)) live[s.q.toLowerCase()] = (live[s.q.toLowerCase()] || 0) + 1;
  const merged = Object.fromEntries(SIM.gaps.map((g) => [g.q, { ...g }]));
  for (const [q, n] of Object.entries(live)) merged[q] = merged[q] ? { ...merged[q], n: merged[q].n + n, live: true } : { q, n, live: true };
  const gaps = Object.values(merged).sort((a, b) => b.n - a.n).slice(0, 7);
  const hovered = rows.find((r) => r.id === hover);

  const totalSwipes = Object.values(saves).reduce((a, b) => a + b, 0) + Object.values(passes).reduce((a, b) => a + b, 0);
  const messages = Object.values(state.threads).reduce((a, t) => a + t.length, 0) + 3120;

  return (
    <div className="insights">
      <h1 className="h1">Club demand report</h1>
      <p className="muted">For Student Government and Campus Activities. Aggregated and anonymous: no names, no individual swipes.</p>

      <div className="kpis">
        <div><strong>{(SIM.students + (state.profile ? 1 : 0)).toLocaleString()}</strong><span>students onboarded</span></div>
        <div><strong>{totalSwipes.toLocaleString()}</strong><span>swipes</span></div>
        <div><strong>{messages.toLocaleString()}</strong><span>messages to clubs</span></div>
      </div>

      <section className="panel">
        <h2 className="h3">Saves by category</h2>
        <p className="muted small bar-caption" aria-live="polite">{hovered ? `${hovered.label}: ${hovered.saves.toLocaleString()} saves, ${Math.round(hovered.rate * 100)}% of swipes in this category` : 'Where student interest is landing this semester. Hover a bar for the save rate.'}</p>
        <ul className="bars" onMouseLeave={() => setHover(null)}>
          {rows.map((r) => (
            <li key={r.id} className="bar-row" tabIndex={0} onMouseEnter={() => setHover(r.id)} onFocus={() => setHover(r.id)} onBlur={() => setHover(null)}>
              <span className="bar-label">{r.label}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(r.saves / max) * 100}%` }} />
              </span>
              <span className="bar-value">{r.saves.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2 className="h3">What students search for but can’t find</h2>
        <p className="muted small">Searches with no strong match in the directory. Candidates for new clubs, events, or funding.</p>
        <ol className="gaps">
          {gaps.map((g) => (
            <li key={g.q}><span>“{g.q}”{g.live && <span className="live-tag">live</span>}</span><span className="gap-n">{g.n}</span></li>
          ))}
        </ol>
      </section>
      <p className="fine">Demo numbers combine a simulated cohort with this device’s live activity (marked “live”).</p>
    </div>
  );
}
