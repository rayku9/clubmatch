import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { moderate, suggestOpeners } from '../ai/engine.js';
import { Icon, Monogram } from '../ui.jsx';
import ClubSheet from './ClubSheet.jsx';

export default function Messages({ openId, setOpenId }) {
  const { state, clubs } = useStore();
  if (openId) {
    const club = clubs.find((c) => c.id === openId);
    if (club) return <Thread club={club} onBack={() => setOpenId(null)} />;
  }
  const withThreads = clubs.filter((c) => state.threads[c.id]?.length)
    .sort((a, b) => state.threads[b.id].at(-1).t - state.threads[a.id].at(-1).t);
  const savedOnly = clubs.filter((c) => state.swipes[c.id] === 'right' && !state.threads[c.id]?.length);

  return (
    <div className="messages">
      <h1 className="h1">Messages</h1>
      {withThreads.length === 0 && savedOnly.length === 0 && (
        <p className="muted">Save a club in Discover and it shows up here, ready to message.</p>
      )}
      {withThreads.length > 0 && (
        <ul className="club-list">
          {withThreads.map((c) => {
            const last = state.threads[c.id].at(-1);
            return (
              <li key={c.id}>
                <button className="club-row" onClick={() => setOpenId(c.id)}>
                  <Monogram club={c} />
                  <span className="club-row-text">
                    <span className="club-row-name">{c.name}</span>
                    <span className="club-row-sum">{last.from === 'student' ? 'You: ' : ''}{last.text}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {savedOnly.length > 0 && (
        <>
          <h2 className="h3 section-gap">Saved clubs you haven’t messaged</h2>
          <ul className="club-list">
            {savedOnly.map((c) => (
              <li key={c.id}>
                <button className="club-row" onClick={() => setOpenId(c.id)}>
                  <Monogram club={c} />
                  <span className="club-row-text">
                    <span className="club-row-name">{c.name}</span>
                    <span className="club-row-sum">Say hi and ask how to get involved</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Thread({ club, onBack }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const [warn, setWarn] = useState('');
  const [error, setError] = useState('');
  const [reported, setReported] = useState(false);
  const [info, setInfo] = useState(false);
  const [openersUsed, setOpenersUsed] = useState(false);
  const end = useRef(null);
  const msgs = state.threads[club.id] || [];
  const openers = suggestOpeners(club, state.profile);
  const showOpeners = msgs.length === 0 && !openersUsed;

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const send = (force = false) => {
    const t = text.trim();
    if (!t) return;
    const m = moderate(t);
    if (m.block) { setError(m.block); return; }
    if (m.warn && !force) { setWarn(m.warn); return; }
    dispatch({ type: 'send', id: club.id, from: 'student', text: t });
    setText(''); setWarn(''); setError('');
  };

  return (
    <div className="thread">
      <header className="thread-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back to messages"><Icon name="back" /></button>
        <button className="thread-title" onClick={() => setInfo(true)}>
          <Monogram club={club} size={36} />
          <span>{club.name}</span>
        </button>
        <button className="icon-btn" onClick={() => setReported(true)} aria-label="Report this conversation"><Icon name="flag" size={20} /></button>
      </header>
      {reported && <div className="notice">Reported. A Campus Activities moderator will review this conversation. <button className="link" onClick={() => setReported(false)}>Dismiss</button></div>}
      <div className="bubbles">
        {msgs.length === 0 && <p className="thread-empty">Say hi to {club.name}. Ask how to get involved, when they meet, or what members do.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.from === 'student' ? 'me' : 'them'}`}>{m.text}</div>
        ))}
        <div ref={end} />
      </div>
      {showOpeners && (
        <div className="openers">
          <div className="ai-note-head"><Icon name="spark" size={14} stroke={2.2} /> Suggested openers, based on your profile</div>
          {openers.map((o) => <button key={o} className="opener" onClick={() => { setText(o); setOpenersUsed(true); }}>{o}</button>)}
        </div>
      )}
      {error && <div className="notice notice-error">{error}</div>}
      {warn && (
        <div className="notice">
          <Icon name="shield" size={16} /> {warn}
          <div className="notice-actions">
            <button className="btn btn-quiet btn-sm" onClick={() => setWarn('')}>Edit message</button>
            <button className="btn btn-secondary btn-sm" onClick={() => send(true)}>Send anyway</button>
          </div>
        </div>
      )}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="input" value={text} onChange={(e) => { setText(e.target.value); setError(''); setWarn(''); }} placeholder={`Message ${club.name}`} aria-label="Message" />
        <button className="round round-send" type="submit" disabled={!text.trim()} aria-label="Send"><Icon name="send" size={20} /></button>
      </form>
      {info && <ClubSheet club={club} onClose={() => setInfo(false)} />}
    </div>
  );
}
