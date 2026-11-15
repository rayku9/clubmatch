import { useState } from 'react';
import { useStore } from '../store.jsx';
import { draftClubProfile, draftOfficerReply, moderate, think } from '../ai/engine.js';
import { CATEGORIES, TAGS } from '../data/taxonomy.js';
import { SAMPLE_CLUB_TEXT } from '../data/sample.js';
import { ACCESS, AccessBadge, Icon, Monogram } from '../ui.jsx';

export default function Officer() {
  const { state, dispatch, clubs } = useStore();
  const [tab, setTab] = useState('inbox');
  const club = clubs.find((c) => c.id === state.officerClubId) || clubs[0];

  return (
    <div className="officer">
      <div className="officer-pick">
        <label className="field-label" htmlFor="clubpick">Managing</label>
        <select id="clubpick" className="input" value={club.id} onChange={(e) => { dispatch({ type: 'setOfficerClub', id: e.target.value }); setTab('inbox'); }}>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'inbox'} className={`tab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>Inbox</button>
        <button role="tab" aria-selected={tab === 'page'} className={`tab ${tab === 'page' ? 'on' : ''}`} onClick={() => setTab('page')}>Club page</button>
        <button role="tab" aria-selected={tab === 'new'} className={`tab ${tab === 'new' ? 'on' : ''}`} onClick={() => setTab('new')}>Add a club</button>
      </div>
      {tab === 'inbox' && <Inbox club={club} />}
      {tab === 'page' && <ClubPage club={club} />}
      {tab === 'new' && <NewClub onDone={() => setTab('page')} />}
    </div>
  );
}

function Inbox({ club }) {
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const msgs = state.threads[club.id] || [];
  const p = state.profile;
  const lastStudent = [...msgs].reverse().find((m) => m.from === 'student');

  const draft = async () => {
    setBusy(true);
    await think(600);
    setText(draftOfficerReply(club, lastStudent?.text));
    setBusy(false);
  };
  const send = () => {
    const m = moderate(text);
    if (m.block) { setError(m.block); return; }
    dispatch({ type: 'send', id: club.id, from: 'club', text: text.trim() });
    setText('');
  };

  if (!msgs.length) {
    return (
      <div className="pad-y">
        <p className="muted">No messages yet. When a student messages {club.name}, the conversation shows up here.</p>
        <p className="muted small">Demo tip: switch to the student view, save this club, and send it a message.</p>
      </div>
    );
  }
  return (
    <div className="officer-inbox">
      <div className="student-card">
        <div className="student-name">{p?.name || 'A USC student'}</div>
        <div className="muted small">{[p?.year, p?.major].filter(Boolean).join(', ')}</div>
        <div className="chips">{Object.keys(p?.tags || {}).slice(0, 5).map((id) => <span key={id} className="chip static">{TAGS[id].label}</span>)}</div>
        <div className="small muted">{state.shareResume ? 'Resume shared with clubs they message.' : 'Resume private. The student hasn’t chosen to share it.'}</div>
      </div>
      <div className="bubbles">
        {msgs.map((m, i) => <div key={i} className={`bubble ${m.from === 'club' ? 'me' : 'them'}`}>{m.text}</div>)}
      </div>
      {error && <div className="notice notice-error">{error}</div>}
      <textarea className="input textarea" rows={5} value={text} onChange={(e) => { setText(e.target.value); setError(''); }} placeholder="Write a reply" aria-label="Reply" />
      <div className="row-between">
        <button className="btn btn-quiet" onClick={draft} disabled={busy}><Icon name="spark" size={16} /> {busy ? 'Drafting…' : 'Draft a reply with AI'}</button>
        <button className="btn btn-primary" onClick={send} disabled={!text.trim()}>Send reply</button>
      </div>
      <p className="fine">AI drafts only use what’s on your club page. Review before sending.</p>
    </div>
  );
}

function ClubPage({ club }) {
  const { state } = useStore();
  const interested = Object.entries(state.swipes).filter(([id, d]) => id === club.id && d === 'right').length;
  return (
    <div className="pad-y">
      <div className="sheet-head">
        <Monogram club={club} size={56} />
        <div>
          <h2 className="h2">{club.name}</h2>
          <div className="muted small">{CATEGORIES[club.category].label}</div>
        </div>
      </div>
      <p className="body">{club.summary}</p>
      <p className="body muted">{club.hook}</p>
      <AccessBadge club={club} />
      <div className="field-label">Interest tags students are matched on</div>
      <div className="chips">{Object.keys(club.tags).map((id) => <span key={id} className="chip static on">{TAGS[id].label}</span>)}</div>
      <div className="stat-line"><strong>{interested + (club.popularity * 7)}</strong> students saved this club this week <span className="muted small">(demo data)</span></div>
    </div>
  );
}

function NewClub({ onDone }) {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);

  const run = async () => {
    setBusy(true);
    await think(900);
    setDraft(draftClubProfile(name, text));
    setBusy(false);
  };

  if (draft) {
    const set = (k, v) => setDraft({ ...draft, [k]: v });
    const toggleTag = (id) => {
      const tags = { ...draft.tags };
      if (tags[id]) delete tags[id]; else tags[id] = 0.8;
      set('tags', tags);
    };
    return (
      <div className="pad-y">
        <div className="ai-note-head"><Icon name="spark" size={14} stroke={2.2} /> Drafted from your description. Edit anything before publishing.</div>
        {draft.flags.map((f) => <div key={f} className="notice">{f}</div>)}
        <label className="field-label" htmlFor="dn">Club name</label>
        <input id="dn" className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} />
        <label className="field-label" htmlFor="ds">One-line summary</label>
        <textarea id="ds" className="input textarea" rows={3} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
        <label className="field-label" htmlFor="dh">What members do</label>
        <input id="dh" className="input" value={draft.hook} onChange={(e) => set('hook', e.target.value)} />
        <label className="field-label" htmlFor="dc">Category</label>
        <select id="dc" className="input" value={draft.category} onChange={(e) => set('category', e.target.value)}>
          {Object.entries(CATEGORIES).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
        </select>
        <label className="field-label" htmlFor="da">How to join</label>
        <select id="da" className="input" value={draft.access} onChange={(e) => set('access', e.target.value)}>
          {Object.entries(ACCESS).map(([id, a]) => <option key={id} value={id}>{a.label}</option>)}
        </select>
        <div className="field-label">Interest tags</div>
        <div className="chips">
          {Object.entries(TAGS).map(([id, t]) => (
            <button key={id} className={`chip ${draft.tags[id] ? 'on' : ''}`} onClick={() => toggleTag(id)}>{t.label}</button>
          ))}
        </div>
        <div className="row-between">
          <button className="btn btn-quiet" onClick={() => setDraft(null)}>Start over</button>
          <button className="btn btn-primary" disabled={!Object.keys(draft.tags).length} onClick={() => { const { flags, ...club } = draft; dispatch({ type: 'addClub', club }); onDone(); }}>Publish club page</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pad-y">
      <p className="muted">Paste your club’s Instagram bio, EngageSC description, or a few sentences. AI drafts the page; you review it.</p>
      <label className="field-label" htmlFor="nn">Club name</label>
      <input id="nn" className="input" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="field-label" htmlFor="nt">About the club</label>
      <textarea id="nt" className="input textarea" rows={7} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row-between">
        <button className="btn btn-quiet" onClick={() => { setName('Browser Games Collective'); setText(SAMPLE_CLUB_TEXT); }}>Use sample text</button>
        <button className="btn btn-primary" disabled={busy || !name.trim() || text.trim().length < 30} onClick={run}>{busy ? 'Drafting…' : 'Draft club page'}</button>
      </div>
      <p className="fine">Demo: new clubs publish right away. In production, Campus Activities would verify officers against EngageSC first.</p>
    </div>
  );
}
