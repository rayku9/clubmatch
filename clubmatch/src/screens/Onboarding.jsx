import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { TAGS, MAJORS, GOALS } from '../data/taxonomy.js';
import { SAMPLE_RESUME } from '../data/sample.js';
import { extractProfile, profileFromAnswers, think } from '../ai/engine.js';
import { Icon } from '../ui.jsx';
import { APP_NAME } from '../config.js';

export default function Onboarding() {
  const { state, dispatch, clubs } = useStore();
  const [step, setStep] = useState(state.email ? 'method' : 'welcome');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [resume, setResume] = useState('');
  const [answers, setAnswers] = useState({ name: '', major: '', year: '', interests: [], goals: [], openOnly: false });
  const [draft, setDraft] = useState(null);
  const [progress, setProgress] = useState(0);

  const signIn = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@usc\.edu$/i.test(email.trim())) { setErr('Use your @usc.edu email. Only USC students can sign in.'); return; }
    dispatch({ type: 'signIn', email: email.trim().toLowerCase() });
    setStep('method');
  };

  const build = async (fromResume) => {
    setStep('processing');
    setProgress(0);
    const p = fromResume ? extractProfile(resume) : profileFromAnswers(answers);
    if (fromResume) p.openOnly = false;
    for (let i = 1; i <= 3; i++) { await think(700); setProgress(i); }
    await think(350);
    setDraft(p);
    setStep('review');
  };

  const toggle = (key, id) => setAnswers((a) => ({ ...a, [key]: a[key].includes(id) ? a[key].filter((x) => x !== id) : [...a[key], id] }));

  if (step === 'welcome') return (
    <div className="onb onb-welcome">
      <div className="onb-hero">
        <div className="wordmark-xl">{APP_NAME}</div>
        <p className="onb-lede">Find USC clubs that fit you. Swipe through them, save the ones you like, and message them directly.</p>
      </div>
      <form className="onb-form" onSubmit={signIn}>
        <label className="field-label" htmlFor="email">USC email</label>
        <input id="email" className="input" type="email" placeholder="ttrojan@usc.edu" value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(''); }} autoComplete="email" />
        {err && <p className="error">{err}</p>}
        <button className="btn btn-primary btn-block" type="submit">Continue</button>
        <p className="fine"><Icon name="shield" size={14} /> Demo sign-in accepts any @usc.edu address. The full version would use USC single sign-on.</p>
      </form>
    </div>
  );

  if (step === 'method') return (
    <div className="onb">
      <h1 className="h1">Let’s build your profile</h1>
      <p className="muted">Pick one. You can edit everything afterwards.</p>
      <div className="choice-list">
        <button className="choice" onClick={() => setStep('resume')}>
          <span className="choice-title">Paste your resume</span>
          <span className="choice-sub">AI pulls out your major, skills, and interests. Contact info is removed first.</span>
        </button>
        <button className="choice" onClick={() => setStep('questions')}>
          <span className="choice-title">Answer a few questions</span>
          <span className="choice-sub">About a minute. Good if you don’t have a resume handy.</span>
        </button>
      </div>
    </div>
  );

  if (step === 'resume') return (
    <div className="onb">
      <button className="link-back" onClick={() => setStep('method')}><Icon name="back" size={18} /> Back</button>
      <h1 className="h1">Paste your resume</h1>
      <p className="muted">Plain text works best. Emails, phone numbers, and addresses are removed before anything is read.</p>
      <textarea className="input textarea" rows={12} value={resume} onChange={(e) => setResume(e.target.value)} placeholder="Paste resume text here" />
      <div className="row-between">
        <button className="btn btn-quiet" onClick={() => setResume(SAMPLE_RESUME)}>Use a sample resume</button>
        <button className="btn btn-primary" disabled={resume.trim().length < 40} onClick={() => build(true)}>Build my profile</button>
      </div>
    </div>
  );

  if (step === 'questions') return (
    <div className="onb">
      <button className="link-back" onClick={() => setStep('method')}><Icon name="back" size={18} /> Back</button>
      <h1 className="h1">A few questions</h1>
      <label className="field-label" htmlFor="name">First name (optional)</label>
      <input id="name" className="input" value={answers.name} onChange={(e) => setAnswers({ ...answers, name: e.target.value })} />
      <label className="field-label" htmlFor="major">Major</label>
      <input id="major" className="input" list="majors" value={answers.major} onChange={(e) => setAnswers({ ...answers, major: e.target.value })} placeholder="Start typing" />
      <datalist id="majors">{MAJORS.map((m) => <option key={m} value={m} />)}</datalist>
      <div className="field-label">Year</div>
      <div className="seg">
        {['First-year', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map((y) => (
          <button key={y} className={`seg-btn ${answers.year === y ? 'on' : ''}`} onClick={() => setAnswers({ ...answers, year: y })}>{y}</button>
        ))}
      </div>
      <div className="field-label">What are you into? <span className="muted">Pick at least 3</span></div>
      <div className="chips">
        {Object.entries(TAGS).map(([id, t]) => (
          <button key={id} className={`chip ${answers.interests.includes(id) ? 'on' : ''}`} onClick={() => toggle('interests', id)}>{t.label}</button>
        ))}
      </div>
      <div className="field-label">What do you want from a club?</div>
      <div className="chips">
        {GOALS.map((g) => (
          <button key={g.id} className={`chip ${answers.goals.includes(g.id) ? 'on' : ''}`} onClick={() => toggle('goals', g.id)}>{g.label}</button>
        ))}
      </div>
      <label className="check">
        <input type="checkbox" checked={answers.openOnly} onChange={(e) => setAnswers({ ...answers, openOnly: e.target.checked })} />
        Prioritize clubs I can join without applying
      </label>
      <button className="btn btn-primary btn-block" disabled={answers.interests.length < 3} onClick={() => build(false)}>Build my profile</button>
    </div>
  );

  if (step === 'processing') {
    const steps = ['Removing contact info', 'Finding your skills and interests', `Ranking ${clubs.length} clubs for you`];
    return (
      <div className="onb onb-processing">
        <div className="pulse"><Icon name="spark" size={34} /></div>
        <h1 className="h1">Building your profile</h1>
        <ul className="steps">
          {steps.map((s, i) => (
            <li key={s} className={progress > i ? 'done' : progress === i ? 'active' : ''}>
              <span className="step-dot">{progress > i ? <Icon name="check" size={14} stroke={3} /> : null}</span>{s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <Review draft={draft} setDraft={setDraft} onDone={() => dispatch({ type: 'setProfile', profile: draft })} />;
}

function Review({ draft, setDraft, onDone }) {
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { window.scrollTo?.(0, 0); }, []);
  const tagIds = Object.keys(draft.tags).sort((a, b) => draft.tags[b].w - draft.tags[a].w);
  const toggle = (id) => {
    const tags = { ...draft.tags };
    if (tags[id]) delete tags[id]; else tags[id] = { w: 1, src: ['you added it'] };
    setDraft({ ...draft, tags });
  };
  return (
    <div className="onb">
      <h1 className="h1">Here’s your profile</h1>
      <p className="muted">Check it over. Tap an interest to remove it.</p>
      {draft.removed?.length > 0 && (
        <div className="privacy-note">
          <Icon name="shield" size={18} />
          <span>Removed before reading: {draft.removed.map((r) => `${r.count} ${r.label}${r.count > 1 ? 's' : ''}`).join(', ')}. Your resume stays private unless you choose to share it.</span>
        </div>
      )}
      <dl className="facts">
        <div><dt>Name</dt><dd><input className="input input-inline" value={draft.name} placeholder="Add your name" onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></dd></div>
        <div><dt>Major</dt><dd><input className="input input-inline" value={draft.major} placeholder="Add your major" onChange={(e) => setDraft({ ...draft, major: e.target.value })} /></dd></div>
        <div><dt>Year</dt><dd><input className="input input-inline" value={draft.year} placeholder="Add your year" onChange={(e) => setDraft({ ...draft, year: e.target.value })} /></dd></div>
        {draft.skills.length > 0 && <div><dt>Skills</dt><dd>{draft.skills.join(', ')}</dd></div>}
      </dl>
      <div className="field-label">Interests</div>
      <ul className="interest-list">
        {tagIds.map((id) => (
          <li key={id}>
            <button className="chip on" onClick={() => toggle(id)} aria-label={`Remove ${TAGS[id].label}`}>{TAGS[id].label} <Icon name="x" size={12} stroke={2.5} /></button>
            <span className="src">from {draft.tags[id].src[0]}</span>
          </li>
        ))}
      </ul>
      <button className="btn btn-quiet" onClick={() => setShowAll(!showAll)}>{showAll ? 'Hide' : 'Add more interests'}</button>
      {showAll && (
        <div className="chips">
          {Object.entries(TAGS).filter(([id]) => !draft.tags[id]).map(([id, t]) => (
            <button key={id} className="chip" onClick={() => toggle(id)}>{t.label}</button>
          ))}
        </div>
      )}
      <button className="btn btn-primary btn-block" disabled={tagIds.length === 0} onClick={onDone}>Start swiping</button>
    </div>
  );
}
