import { createContext, useContext, useEffect, useReducer } from 'react';
import { SEED_CLUBS } from './data/clubs.js';
import { learn } from './ai/engine.js';

const KEY = 'clubmatch-demo-v1';

const initial = {
  email: '',
  profile: null,
  learned: {},
  swipes: {}, // clubId -> 'right' | 'left'
  swipeLog: [], // [{id, dir, t}]
  customClubs: [],
  threads: {}, // clubId -> [{from: 'student'|'club', text, t, auto?}]
  searches: [], // [{q, strong, t}]
  role: 'student',
  officerClubId: 'scope',
  shareResume: false,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

export const allClubs = (s) => [...s.customClubs, ...SEED_CLUBS];

function reducer(s, a) {
  switch (a.type) {
    case 'signIn': return { ...s, email: a.email };
    case 'setProfile': return { ...s, profile: a.profile };
    case 'swipe': {
      const club = allClubs(s).find((c) => c.id === a.id);
      return {
        ...s,
        swipes: { ...s.swipes, [a.id]: a.dir },
        swipeLog: [...s.swipeLog, { id: a.id, dir: a.dir, t: Date.now() }],
        learned: club ? learn(s.learned, club, a.dir) : s.learned,
      };
    }
    case 'undoSwipe': {
      const last = s.swipeLog[s.swipeLog.length - 1];
      if (!last) return s;
      const club = allClubs(s).find((c) => c.id === last.id);
      const swipes = { ...s.swipes };
      delete swipes[last.id];
      // reverse the learning step
      const reverse = club ? learn({}, club, last.dir) : {};
      const learned = { ...s.learned };
      for (const [k, v] of Object.entries(reverse)) learned[k] = (learned[k] || 0) - v;
      return { ...s, swipes, swipeLog: s.swipeLog.slice(0, -1), learned };
    }
    case 'unsave': {
      const swipes = { ...s.swipes };
      delete swipes[a.id];
      return { ...s, swipes };
    }
    case 'send': {
      const list = s.threads[a.id] || [];
      return { ...s, threads: { ...s.threads, [a.id]: [...list, { from: a.from, text: a.text, t: Date.now() }] } };
    }
    case 'search': return { ...s, searches: [...s.searches, { q: a.q, strong: a.strong, t: Date.now() }].slice(-200) };
    case 'addClub': return { ...s, customClubs: [a.club, ...s.customClubs], officerClubId: a.club.id };
    case 'setRole': return { ...s, role: a.role };
    case 'setOfficerClub': return { ...s, officerClubId: a.id };
    case 'toggleTag': {
      const tags = { ...s.profile.tags };
      if (tags[a.id]) delete tags[a.id];
      else tags[a.id] = { w: 1, src: ['you added it'] };
      return { ...s, profile: { ...s.profile, tags } };
    }
    case 'setPref': return a.key === 'shareResume' ? { ...s, shareResume: a.value } : { ...s, profile: { ...s.profile, [a.key]: a.value } };
    case 'resetTaste': return { ...s, learned: {}, swipes: {}, swipeLog: [] };
    case 'reset': return { ...initial };
    default: return s;
  }
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable: keep in memory */ }
  }, [state]);
  return <Ctx.Provider value={{ state, dispatch, clubs: allClubs(state) }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
