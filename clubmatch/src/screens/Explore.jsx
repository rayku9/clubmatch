import { useState } from 'react';
import { useStore } from '../store.jsx';
import { searchClubs, think } from '../ai/engine.js';
import { CATEGORIES, TAGS } from '../data/taxonomy.js';
import { AccessBadge, Icon, Monogram } from '../ui.jsx';
import ClubSheet from './ClubSheet.jsx';

const EXAMPLES = [
  'chill climbing club, no application',
  'build apps with AI',
  'volunteer with kids',
  'make music with other people',
  'game dev club on weekends',
];

export default function Explore() {
  const { state, dispatch, clubs } = useStore();
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [cat, setCat] = useState('all');
  const [sheet, setSheet] = useState(null);

  const run = async (query) => {
    const text = (query ?? q).trim();
    if (!text) return;
    setQ(text);
    setBusy(true);
    await think(550);
    const r = searchClubs(text, clubs, state.profile, state.learned);
    setRes(r);
    setBusy(false);
    dispatch({ type: 'search', q: text, strong: r.strong });
  };

  const list = res ? res.results.map((r) => r.club) : clubs.filter((c) => cat === 'all' || c.category === cat);

  return (
    <div className="explore">
      <form className="search" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <Icon name="search" size={20} />
        <input className="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe the club you want" aria-label="Search clubs" />
        {q && <button type="button" className="search-clear" onClick={() => { setQ(''); setRes(null); }} aria-label="Clear search"><Icon name="x" size={16} /></button>}
      </form>

      {!res && !busy && (
        <div className="examples">
          <span className="muted small">Try</span>
          {EXAMPLES.map((e) => <button key={e} className="chip chip-ghost" onClick={() => run(e)}>{e}</button>)}
        </div>
      )}

      {busy && <div className="ai-thinking"><span className="pulse-dot" /> Reading your request</div>}

      {res && !busy && (
        <div className="understood">
          <div className="ai-note-head"><Icon name="spark" size={14} stroke={2.2} /> Understood</div>
          <div className="chips">
            {res.parsed.tags.map((t) => <span key={t} className="chip on static">{TAGS[t].label}</span>)}
            {res.parsed.open && <span className="chip on static">No application</span>}
            {res.parsed.beginner && <span className="chip on static">Beginner-friendly</span>}
            {!res.parsed.tags.length && !res.parsed.open && !res.parsed.beginner && <span className="muted small">Matched on club names only.</span>}
          </div>
          {res.parsed.timeAsked.length > 0 && (
            <p className="small">Clubs haven’t listed meeting times yet, so results aren’t filtered by “{res.parsed.timeAsked.join(', ')}”. Ask in Messages.</p>
          )}
          {!res.strong && (
            <p className="small gap-note">No club matches {res.missing?.length ? `“${res.missing.join(', ')}”` : res.parsed.tags.length ? `“${res.parsed.tags.map((t) => TAGS[t].label).join(', ')}”` : res.parsed.leftover.length ? `“${res.parsed.leftover.slice(0, 3).join(' ')}”` : 'this'} directly{res.results.length ? '. Closest options are below' : ''}. This search was added anonymously to the demand report Student Government sees.</p>
          )}
        </div>
      )}

      {!res && (
        <div className="cat-row" role="tablist" aria-label="Filter by category">
          <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
          {Object.entries(CATEGORIES).map(([id, c]) => (
            <button key={id} className={`chip ${cat === id ? 'on' : ''}`} onClick={() => setCat(id)}>{c.label}</button>
          ))}
        </div>
      )}

      {!busy && (
        <ul className="club-list">
          {list.map((club) => (
            <li key={club.id}>
              <button className="club-row" onClick={() => setSheet(club)}>
                <Monogram club={club} />
                <span className="club-row-text">
                  <span className="club-row-name">{club.name}{state.swipes[club.id] === 'right' && <Icon name="heart" size={14} className="saved-heart" />}</span>
                  <span className="club-row-sum">{club.summary}</span>
                  <AccessBadge club={club} />
                </span>
              </button>
            </li>
          ))}
          {res && list.length === 0 && <li className="muted pad">Nothing close enough. Try different words, or browse by category.</li>}
        </ul>
      )}
      {sheet && <ClubSheet club={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}
