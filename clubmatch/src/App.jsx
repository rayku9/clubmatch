import { useEffect, useMemo, useRef, useState } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import { NavCtx } from './nav.js';
import { Icon } from './ui.jsx';
import { APP_NAME } from './config.js';
import Onboarding from './screens/Onboarding.jsx';
import Discover from './screens/Discover.jsx';
import Explore from './screens/Explore.jsx';
import Messages from './screens/Messages.jsx';
import Profile from './screens/Profile.jsx';
import Officer from './screens/Officer.jsx';
import Insights from './screens/Insights.jsx';

const TABS = [
  { id: 'discover', label: 'Discover', icon: 'cards' },
  { id: 'explore', label: 'Explore', icon: 'search' },
  { id: 'messages', label: 'Messages', icon: 'chat' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

function Shell() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('discover');
  const [openId, setOpenId] = useState(null);
  const nav = useMemo(() => ({
    go: (t) => { setOpenId(null); setTab(t); },
    openThread: (id) => { dispatch({ type: 'setRole', role: 'student' }); setOpenId(id); setTab('messages'); },
  }), [dispatch]);

  const role = state.role;
  const needsOnboarding = role === 'student' && !state.profile;
  const inThread = role === 'student' && tab === 'messages' && openId;
  useEffect(() => { window.scrollTo(0, 0); }, [tab, role, needsOnboarding, openId]);
  // Finishing onboarding (or signing in again after a reset) always lands on Discover.
  const wasOnboarding = useRef(needsOnboarding);
  useEffect(() => {
    if (wasOnboarding.current && !needsOnboarding) { setTab('discover'); setOpenId(null); }
    wasOnboarding.current = needsOnboarding;
  }, [needsOnboarding]);

  return (
    <NavCtx.Provider value={nav}>
      <div className="app">
        <header className="topbar">
          <span className="wordmark">{APP_NAME}</span>
          <label className="role">
            <span className="sr-only">View as</span>
            <select value={role} onChange={(e) => dispatch({ type: 'setRole', role: e.target.value })}>
              <option value="student">Student view</option>
              <option value="officer">Club officer view</option>
              <option value="usg">Student Government view</option>
            </select>
          </label>
        </header>
        <main className={`main ${inThread ? 'main-thread' : ''}`}>
          {role === 'officer' && <Officer />}
          {role === 'usg' && <Insights />}
          {needsOnboarding && <Onboarding />}
          {role === 'student' && !needsOnboarding && (
            <>
              {tab === 'discover' && <Discover />}
              {tab === 'explore' && <Explore />}
              {tab === 'messages' && <Messages openId={openId} setOpenId={setOpenId} />}
              {tab === 'profile' && <Profile />}
            </>
          )}
        </main>
        {role === 'student' && !needsOnboarding && !inThread && (
          <nav className="tabbar" aria-label="Main">
            {TABS.map((t) => (
              <button key={t.id} className={`tabbar-btn ${tab === t.id ? 'on' : ''}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => nav.go(t.id)}>
                <Icon name={t.icon} size={22} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </NavCtx.Provider>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
