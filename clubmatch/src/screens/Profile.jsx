import { useState } from 'react';
import { useStore } from '../store.jsx';
import { tasteProfile } from '../ai/engine.js';
import { TAGS } from '../data/taxonomy.js';
import { AI_LABEL } from '../ai/provider.js';
import { Icon } from '../ui.jsx';

export default function Profile() {
  const { state, dispatch } = useStore();
  const p = state.profile;
  const [confirming, setConfirming] = useState(false);
  const taste = tasteProfile(p, state.learned);
  const max = Math.max(1, ...taste.map((t) => t.w));
  const saved = Object.values(state.swipes).filter((d) => d === 'right').length;
  const passed = Object.values(state.swipes).filter((d) => d === 'left').length;

  return (
    <div className="profile">
      <h1 className="h1">{p.name || 'Your profile'}</h1>
      <p className="muted">{[p.year, p.major].filter(Boolean).join(', ') || 'Add your year and major from onboarding'} <br />{state.email}</p>

      <section className="panel">
        <h2 className="h3">What your feed ranks by</h2>
        <p className="muted small">Starts from your profile and shifts with every swipe. {saved} saved, {passed} passed.</p>
        <ul className="taste-bars">
          {taste.map((t) => (
            <li key={t.id}>
              <span className="taste-label">{t.label}</span>
              <span className="taste-track"><span className="taste-fill" style={{ width: `${(t.w / max) * 100}%` }} /></span>
            </li>
          ))}
        </ul>
        <button className="btn btn-quiet btn-sm" onClick={() => dispatch({ type: 'resetTaste' })}>Reset swipes and learning</button>
      </section>

      <section className="panel">
        <h2 className="h3">Interests</h2>
        <p className="muted small">Tap to add or remove.</p>
        <div className="chips">
          {Object.entries(TAGS).map(([id, t]) => (
            <button key={id} className={`chip ${p.tags[id] ? 'on' : ''}`} onClick={() => dispatch({ type: 'toggleTag', id })}>{t.label}</button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="h3"><Icon name="shield" size={18} /> Privacy and safety</h2>
        <label className="check">
          <input type="checkbox" checked={state.shareResume} onChange={(e) => dispatch({ type: 'setPref', key: 'shareResume', value: e.target.checked })} />
          Let clubs I message see my resume
        </label>
        <label className="check">
          <input type="checkbox" checked={!!p.openOnly} onChange={(e) => dispatch({ type: 'setPref', key: 'openOnly', value: e.target.checked })} />
          Rank clubs without applications higher
        </label>
        <ul className="plain small muted">
          <li>Only @usc.edu accounts can sign in.</li>
          <li>Contact info is removed from resumes before the AI reads them.</li>
          <li>Messages are checked for harassment and accidental sharing of personal info.</li>
          <li>AI: {AI_LABEL}. In this demo, nothing you enter leaves your device.</li>
        </ul>
      </section>

      <button className="btn btn-secondary btn-block" onClick={() => (confirming ? dispatch({ type: 'reset' }) : setConfirming(true))} onBlur={() => setConfirming(false)}>
        {confirming ? 'Tap again to sign out and clear data' : 'Sign out and clear demo data'}
      </button>
    </div>
  );
}
