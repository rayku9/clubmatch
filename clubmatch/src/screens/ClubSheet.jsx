import { useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import { explainMatch } from '../ai/engine.js';
import { CATEGORIES } from '../data/taxonomy.js';
import { AccessBadge, AiNote, Icon, Monogram } from '../ui.jsx';
import { useNav } from '../nav.js';

export function joinText(club) {
  if (club.access === 'open') return club.accessNote || 'Anyone can join. Show up to a meeting or sign up through the club page.';
  if (club.access === 'application') return `${club.accessNote ? club.accessNote + ' ' : ''}Message the club to get application dates.`;
  if (club.access === 'both') return club.accessNote || 'General membership is open; some programs use an application.';
  return 'This club hasn’t listed how to join yet. Message them and ask.';
}

export default function ClubSheet({ club, onClose, justSaved = false }) {
  const { state, dispatch, clubs } = useStore();
  const nav = useNav();
  const ref = useRef(null);
  const saved = state.swipes[club.id] === 'right';
  const liked = clubs.filter((c) => state.swipes[c.id] === 'right' && c.id !== club.id);
  const why = explainMatch(club, state.profile, state.learned, liked);
  const cat = CATEGORIES[club.category];

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-wrap" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={club.name} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        {justSaved && <div className="saved-banner"><Icon name="heart" size={16} /> Saved. Here’s how to get involved.</div>}
        <div className="sheet-head">
          <Monogram club={club} size={56} />
          <div>
            <h2 className="h2">{club.name}</h2>
            <div className="muted small">{cat?.label}{club.custom ? ', new this week' : ''}</div>
          </div>
        </div>
        <p className="body">{club.summary}</p>
        <AiNote>
          <p>{why.line}</p>
          {why.reasons.length > 0 && (
            <ul className="reasons">
              {why.reasons.map((r) => <li key={r.id}><strong>{r.label}</strong> <span className="muted">from {r.source}</span></li>)}
            </ul>
          )}
        </AiNote>
        <section className="sheet-section">
          <h3 className="h3">How to join</h3>
          <AccessBadge club={club} />
          <p className="body">{joinText(club)}</p>
          <a className="ext" href={club.link} target="_blank" rel="noreferrer"><Icon name="link" size={16} /> {club.link.includes('engage.usc.edu') ? 'Find them on EngageSC' : 'Club website'}</a>
        </section>
        <div className="sheet-actions">
          <button className="btn btn-primary" onClick={() => { onClose(); nav.openThread(club.id); }}><Icon name="chat" size={18} /> Message club</button>
          {justSaved
            ? <button className="btn btn-secondary" onClick={onClose}>Keep swiping</button>
            : saved
              ? <button className="btn btn-secondary" onClick={() => dispatch({ type: 'unsave', id: club.id })}>Remove from saved</button>
              : <button className="btn btn-secondary" onClick={() => dispatch({ type: 'swipe', id: club.id, dir: 'right' })}><Icon name="heart" size={18} /> Save</button>}
        </div>
      </div>
    </div>
  );
}
