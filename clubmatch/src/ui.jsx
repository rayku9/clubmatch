import { CATEGORIES } from './data/taxonomy.js';

const paths = {
  x: <path d="M6 6l12 12M18 6L6 18" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>,
  chat: <path d="M5 18l-1 3 4-2h9a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v9" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  cards: <><rect x="6" y="3" width="12" height="16" rx="2" /><path d="M3 7v12a2 2 0 0 0 2 2h10" /></>,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  send: <path d="M4 12l16-8-6 16-2-6z" />,
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  flag: <path d="M5 21V4h11l-2 4 2 4H5" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  check: <path d="M5 12l5 5 9-10" />,
};

export function Icon({ name, size = 22, stroke = 2, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {paths[name]}
    </svg>
  );
}

export function initials(name) {
  const clean = name.replace(/\(.*?\)/g, '').replace(/^(USC|SC)\s+/i, '').trim();
  const words = clean.split(/\s+/).filter((w) => !/^(the|of|for|and|club|team|design)$/i.test(w));
  if (words.length === 1) return words[0].slice(0, 2);
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function Monogram({ club, size = 44 }) {
  const cat = CATEGORIES[club.category] || CATEGORIES.culture;
  return (
    <span className="mono" style={{ background: cat.color, color: cat.ink, width: size, height: size, fontSize: size * 0.4 }}>
      {initials(club.name)}
    </span>
  );
}

export const ACCESS = {
  open: { label: 'Open to join', tone: 'open' },
  application: { label: 'Application', tone: 'apply' },
  both: { label: 'Open + selective program', tone: 'open' },
  ask: { label: 'Ask the club how to join', tone: 'ask' },
};

export function AccessBadge({ club }) {
  const a = ACCESS[club.access] || ACCESS.ask;
  return <span className={`badge badge-${a.tone}`}>{a.label}</span>;
}

export function AiNote({ children, label = 'Why you match' }) {
  return (
    <div className="ai-note">
      <div className="ai-note-head"><Icon name="spark" size={14} stroke={2.2} /> {label}</div>
      <div>{children}</div>
    </div>
  );
}
