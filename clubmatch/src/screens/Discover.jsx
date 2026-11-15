import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { rankDeck, explainMatch, tasteProfile } from '../ai/engine.js';
import { CATEGORIES } from '../data/taxonomy.js';
import { AccessBadge, Icon, initials } from '../ui.jsx';
import { LOGOS } from '../data/logos.js';
import ClubSheet from './ClubSheet.jsx';
import { useNav } from '../nav.js';

const THRESHOLD = 110;

function fitLabel(score) {
  if (score > 0.55) return 'Strong fit';
  if (score > 0.3) return 'Good fit';
  return 'Something new';
}

export default function Discover() {
  const { state, dispatch, clubs } = useStore();
  const nav = useNav();
  const deck = useMemo(() => rankDeck(clubs, state), [clubs, state.profile, state.learned, state.swipes]); // eslint-disable-line
  const [drag, setDrag] = useState({ dx: 0, dy: 0, active: false });
  const [exit, setExit] = useState(null); // 'left' | 'right'
  const [sheet, setSheet] = useState(null); // {club, justSaved}
  const [toast, setToast] = useState('');
  const start = useRef(null);
  const prevTop = useRef(tasteProfile(state.profile, state.learned)[0]?.id);

  const top = deck[0];
  const next = deck[1];
  const liked = clubs.filter((c) => state.swipes[c.id] === 'right');

  // Tell the user when their swipes shift the ranking.
  useEffect(() => {
    const t = tasteProfile(state.profile, state.learned);
    if (t[0] && t[0].id !== prevTop.current && state.swipeLog.length > 0) {
      setToast(`Your feed is adjusting: more ${t[0].label.toLowerCase()}`);
      const id = setTimeout(() => setToast(''), 2600);
      prevTop.current = t[0].id;
      return () => clearTimeout(id);
    }
    prevTop.current = t[0]?.id;
  }, [state.learned]); // eslint-disable-line

  const commit = useCallback((dir) => {
    if (!top || exit) return;
    setExit(dir);
    const club = top.club;
    setTimeout(() => {
      dispatch({ type: 'swipe', id: club.id, dir });
      setExit(null);
      setDrag({ dx: 0, dy: 0, active: false });
      if (dir === 'right') setSheet({ club, justSaved: true });
    }, 230);
  }, [top, exit, dispatch]);

  useEffect(() => {
    const onKey = (e) => {
      if (sheet || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') commit('left');
      if (e.key === 'ArrowRight') commit('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commit, sheet]);

  const onDown = (e) => {
    if (e.target.closest('button')) return;
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ dx: 0, dy: 0, active: true });
  };
  const onMove = (e) => {
    if (!start.current) return;
    setDrag({ dx: e.clientX - start.current.x, dy: e.clientY - start.current.y, active: true });
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    if (drag.dx > THRESHOLD) commit('right');
    else if (drag.dx < -THRESHOLD) commit('left');
    else if (Math.abs(drag.dx) < 6 && Math.abs(drag.dy) < 6) { setDrag({ dx: 0, dy: 0, active: false }); setSheet({ club: top.club }); }
    else setDrag({ dx: 0, dy: 0, active: false });
  };

  if (!top) {
    return (
      <div className="empty">
        <h1 className="h1">You’ve seen every club</h1>
        <p className="muted">You saved {liked.length}. Message them, or search for something specific.</p>
        <div className="stack">
          <button className="btn btn-primary" onClick={() => nav.go('messages')}>Go to saved clubs</button>
          <button className="btn btn-secondary" onClick={() => nav.go('explore')}>Search clubs</button>
          <button className="btn btn-quiet" onClick={() => dispatch({ type: 'resetTaste' })}>Start the deck over</button>
        </div>
      </div>
    );
  }

  const dx = exit === 'right' ? 600 : exit === 'left' ? -600 : drag.dx;
  const dy = exit ? drag.dy : drag.dy * 0.3;
  const style = { transform: `translate(${dx}px, ${dy}px) rotate(${dx / 18}deg)`, transition: drag.active && !exit ? 'none' : 'transform 230ms ease-out' };
  const intent = dx > 40 ? 'right' : dx < -40 ? 'left' : null;
  const taste = tasteProfile(state.profile, state.learned).slice(0, 3);

  return (
    <div className="discover">
      <div className="taste-strip" aria-label="What your feed is ranking by">
        <span className="muted small">Ranking by</span>
        {taste.map((t) => <span key={t.id} className="taste-pill">{t.label}</span>)}
      </div>
      <div className="deck">
        {next && <Card item={next} behind profile={state.profile} learned={state.learned} liked={liked} />}
        <div className="card-drag" style={style} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <Card item={top} profile={state.profile} learned={state.learned} liked={liked} intent={intent} />
        </div>
      </div>
      <div className="deck-actions">
        <button className="round round-sm" onClick={() => dispatch({ type: 'undoSwipe' })} disabled={!state.swipeLog.length} aria-label="Undo last swipe"><Icon name="undo" size={20} /></button>
        <button className="round round-pass" onClick={() => commit('left')} aria-label="Pass"><Icon name="x" size={30} stroke={2.6} /></button>
        <button className="round round-save" onClick={() => commit('right')} aria-label="Save club"><Icon name="heart" size={30} stroke={2.4} /></button>
        <button className="round round-sm" onClick={() => setSheet({ club: top.club })} aria-label="Club details"><Icon name="info" size={20} /></button>
      </div>
      <p className="hint">Swipe right to save, left to pass. Tap a card for details.</p>
      {toast && <div className="toast" role="status"><Icon name="spark" size={16} /> {toast}</div>}
      {sheet && <ClubSheet club={sheet.club} justSaved={sheet.justSaved} onClose={() => setSheet(null)} />}
    </div>
  );
}

function Card({ item, behind, profile, learned, liked, intent }) {
  const { club, score, gem } = item;
  const cat = CATEGORIES[club.category];
  const why = explainMatch(club, profile, learned, liked);
  return (
    <article className={`card ${behind ? 'card-behind' : ''}`} aria-hidden={behind || undefined}>
      <div className="card-art" style={{ background: cat.color, color: cat.ink }}>
        {LOGOS[club.id]
          ? <img className="card-logo" src={LOGOS[club.id]} alt={`${club.name} logo`} draggable="false" />
          : <span className="card-mono">{initials(club.name)}</span>}
        <span className="card-cat">{cat.label}</span>
        {gem && <span className="gem">Hidden gem</span>}
        {intent === 'right' && <span className="stamp stamp-save">Save</span>}
        {intent === 'left' && <span className="stamp stamp-pass">Pass</span>}
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h2 className="card-name">{club.name}</h2>
          <span className="fit">{fitLabel(score)}</span>
        </div>
        <p className="card-summary">{club.summary}</p>
        <div className="card-why"><Icon name="spark" size={14} stroke={2.2} /> <span>{why.line}</span></div>
        <AccessBadge club={club} />
      </div>
    </article>
  );
}
