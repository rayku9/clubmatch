// Demo AI engine. Runs entirely in the browser — no data leaves the device.
// Every function here has the same inputs/outputs a model-backed version would,
// so a real LLM (e.g. through Replit AI Integrations) can replace any one of them
// without touching the UI. See src/ai/provider.js.
import { TAGS, MAJORS, SKILLS, SKILL_TO_TAG, GOALS, SPECIFIC, RELATED } from '../data/taxonomy.js';

// ---------- text helpers ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reCache = new Map();
function wordRe(w) {
  if (!reCache.has(w)) reCache.set(w, new RegExp(`(^|[^a-z0-9+#])${esc(w)}(?=$|[^a-z0-9+#])`, 'g'));
  const re = reCache.get(w);
  re.lastIndex = 0;
  return re;
}
function hits(text, word) {
  const m = text.match(wordRe(word));
  return m ? m.length : 0;
}
function findWords(text, words) {
  return words.filter((w) => hits(text, w) > 0);
}

export const think = (ms = 650) => new Promise((r) => setTimeout(r, ms));

// ---------- privacy ----------
export function scrubPII(text) {
  const removed = [];
  let clean = text;
  const rules = [
    ['email address', /[\w.+-]+@[\w-]+\.[\w.-]+/g],
    ['phone number', /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g],
    ['street address', /\d{2,6}\s+[A-Za-z0-9.\s]{2,30}\s(St|Street|Ave|Avenue|Blvd|Boulevard|Rd|Road|Dr|Drive|Way|Ln|Lane)\b\.?/g],
  ];
  for (const [label, re] of rules) {
    const m = clean.match(re);
    if (m) {
      removed.push({ label, count: m.length });
      clean = clean.replace(re, `[${label} removed]`);
    }
  }
  return { clean, removed };
}

// ---------- profile building ----------
function addTag(tags, tag, w, src) {
  const cur = tags[tag] || { w: 0, src: [] };
  cur.w = Math.min(1.5, cur.w + w);
  if (src && !cur.src.includes(src)) cur.src.push(src);
  tags[tag] = cur;
}

export function extractProfile(rawText) {
  const { clean, removed } = scrubPII(rawText);
  const text = clean.toLowerCase();
  const firstLine = rawText.trim().split('\n')[0].trim();
  const name = /^[A-Z][a-z]+(\s[A-Z][a-z]+){1,2}$/.test(firstLine) ? firstLine : '';

  const titleCase = (m) => m.replace(/\b(\w)(\w*)/g, (_, a, b) => (/^(and|of)$/.test(a + b) ? a + b : a.toUpperCase() + b));
  const major = titleCase(MAJORS.filter((m) => hits(text, m) > 0).sort((a, b) => b.length - a.length)[0] || '');
  let year = '';
  const classOf = text.match(/class of (20\d\d)|expected[^\n]{0,30}(20\d\d)|(20\d\d)\s*\(expected\)/);
  if (/freshman|first[- ]year/.test(text)) year = 'First-year';
  else if (/sophomore/.test(text)) year = 'Sophomore';
  else if (/junior/.test(text)) year = 'Junior';
  else if (/senior/.test(text)) year = 'Senior';
  else if (/graduate student|master'?s|ph\.?d/.test(text)) year = 'Graduate';
  else if (classOf) {
    const y = Number(classOf[1] || classOf[2] || classOf[3]);
    year = y >= 2030 ? 'First-year' : y === 2029 ? 'Sophomore' : y === 2028 ? 'Junior' : 'Senior';
  }

  const skills = findWords(text, SKILLS);
  const tags = {};
  for (const [id, t] of Object.entries(TAGS)) {
    const found = findWords(text, t.words);
    if (found.length) {
      const n = found.reduce((s, w) => s + hits(text, w), 0);
      addTag(tags, id, Math.min(1, 0.35 + 0.15 * n), `resume: “${found[0]}”`);
    }
  }
  for (const s of skills) if (SKILL_TO_TAG[s]) addTag(tags, SKILL_TO_TAG[s], 0.25, `skill: ${s}`);

  return { name, major, year, skills, tags, goals: [], openOnly: false, removed, source: 'resume' };
}

export function profileFromAnswers({ name, major, year, interests, goals, openOnly }) {
  const tags = {};
  for (const id of interests) addTag(tags, id, 1, 'you picked it');
  for (const g of goals) {
    const goal = GOALS.find((x) => x.id === g);
    if (goal) addTag(tags, goal.tag, 0.4, `goal: ${goal.label.toLowerCase()}`);
  }
  return { name, major, year, skills: [], tags, goals, openOnly, removed: [], source: 'questions' };
}

// ---------- vectors & ranking ----------
const clubVecCache = new WeakMap();
export function clubVector(club) {
  if (clubVecCache.has(club)) return clubVecCache.get(club);
  const v = { ...club.tags };
  const text = `${club.summary} ${club.hook}`.toLowerCase();
  for (const [id, t] of Object.entries(TAGS)) {
    const n = t.words.reduce((s, w) => s + hits(text, w), 0);
    if (n) v[id] = (v[id] || 0) + Math.min(0.3, 0.1 * n);
  }
  clubVecCache.set(club, v);
  return v;
}

export function userVector(profile, learned = {}) {
  const v = {};
  for (const [id, t] of Object.entries(profile?.tags || {})) v[id] = t.w;
  for (const [id, w] of Object.entries(learned)) v[id] = (v[id] || 0) + w;
  for (const id of Object.keys(v)) if (v[id] < 0) v[id] = v[id] * 0.6; // dislikes count, but softer
  return v;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const k of Object.keys(a)) { na += a[k] * a[k]; if (b[k]) dot += a[k] * b[k]; }
  for (const k of Object.keys(b)) nb += b[k] * b[k];
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export function scoreClub(club, uvec, profile) {
  let s = cosine(uvec, clubVector(club));
  if (profile?.openOnly && club.access === 'application') s *= 0.55;
  return s;
}

// Orders the remaining clubs. Every 4th card is a "hidden gem": a less-discovered
// club that still fits, so big clubs don't crowd out small ones.
export function rankDeck(clubs, { profile, learned, swipes }) {
  const uvec = userVector(profile, learned);
  const remaining = clubs.filter((c) => !swipes[c.id]);
  const scored = remaining.map((c) => ({ club: c, score: scoreClub(c, uvec, profile) })).sort((a, b) => b.score - a.score);
  const gems = scored.filter((x) => x.club.popularity <= 4 && x.score > 0.12);
  const out = [];
  const used = new Set();
  let i = 0;
  while (out.length < scored.length) {
    if (out.length % 4 === 3 && gems.length) {
      const g = gems.shift();
      if (!used.has(g.club.id)) { out.push({ ...g, gem: true }); used.add(g.club.id); continue; }
    }
    while (i < scored.length && used.has(scored[i].club.id)) i++;
    if (i >= scored.length) break;
    out.push(scored[i]); used.add(scored[i].club.id); i++;
  }
  return out;
}

// ---------- learning from swipes ----------
export function learn(learned, club, direction) {
  const next = { ...learned };
  const v = clubVector(club);
  const rate = direction === 'right' ? 0.3 : -0.18;
  for (const [id, w] of Object.entries(v)) next[id] = Math.max(-1, Math.min(1.5, (next[id] || 0) + rate * w));
  return next;
}

export function tasteProfile(profile, learned) {
  const v = userVector(profile, learned);
  return Object.entries(v)
    .filter(([, w]) => w > 0.05)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, w]) => ({ id, label: TAGS[id]?.label || id, w }));
}

// ---------- explanations ----------
export function explainMatch(club, profile, learned, swipedClubs = []) {
  const cv = clubVector(club);
  // Lowercase labels for mid-sentence use, but keep acronyms like AI, ML, UX.
  const lc = (label) => label.split(' ').map((w) => (/^[A-Z&]+$/.test(w) ? w : w.toLowerCase())).join(' ');
  const reasons = [];
  for (const [id, cw] of Object.entries(cv)) {
    const pt = profile?.tags?.[id];
    const lw = learned?.[id] || 0;
    const uw = (pt?.w || 0) + Math.max(0, lw);
    if (uw > 0 && cw > 0.25) {
      let source = pt?.src?.[0] || '';
      if (!source && lw > 0) {
        const liked = swipedClubs.find((c) => (clubVector(c)[id] || 0) > 0.4);
        source = liked ? `you liked ${liked.name}` : 'your swipes';
      }
      reasons.push({ id, label: TAGS[id].label, source, weight: uw * cw });
    }
  }
  reasons.sort((a, b) => b.weight - a.weight);
  const top = reasons.slice(0, 2);
  let line;
  if (!top.length) line = `Something different: ${club.hook}`;
  else if (top.length === 1) line = `Fits your interest in ${lc(top[0].label)}. ${club.hook}`;
  else line = `Fits your interest in ${lc(top[0].label)} and ${lc(top[1].label)}. ${club.hook}`;
  return { line, reasons: top };
}

// ---------- natural-language search ----------
const OPEN_WORDS = ['no application', 'no applications', 'no app', 'open', 'no tryouts', 'anyone can join', 'without applying', "don't have to apply", 'no interview'];
const BEGINNER_WORDS = ['beginner', 'beginners', 'no experience', 'new to', 'chill', 'casual', 'low commitment', 'low-key', 'relaxed', 'easy'];
const TIME_WORDS = ['weekend', 'weekends', 'weekday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'morning', 'mornings', 'evening', 'evenings', 'night', 'tonight'];
const STOP = new Set('a an the and or for to of in on with i im i’m am want looking something some club clubs that is are be me my who where like into about at find any please kind type group groups people where'.split(' '));

export function parseQuery(q) {
  const text = ` ${q.toLowerCase()} `;
  const specific = Object.keys(SPECIFIC).filter((w) => hits(text, w) > 0);
  const tags = [...new Set([
    ...Object.entries(TAGS).filter(([, t]) => findWords(text, t.words).length).map(([id]) => id),
    ...specific.map((w) => SPECIFIC[w]),
  ])];
  const open = OPEN_WORDS.some((w) => hits(text, w) > 0);
  const beginner = BEGINNER_WORDS.some((w) => hits(text, w) > 0);
  const timeAsked = TIME_WORDS.filter((w) => hits(text, w) > 0);
  const known = new Set([...Object.values(TAGS).flatMap((t) => t.words), ...Object.keys(SPECIFIC), ...OPEN_WORDS, ...BEGINNER_WORDS, ...TIME_WORDS].flatMap((w) => w.split(' ')));
  const leftover = q.toLowerCase().replace(/[^a-z0-9+#\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !known.has(w));
  return { tags, specific, open, beginner, timeAsked, leftover };
}

export function searchClubs(q, clubs, profile, learned) {
  const parsed = parseQuery(q);
  const qvec = Object.fromEntries(parsed.tags.map((t) => [t, 1]));
  const uvec = userVector(profile, learned);
  let results = clubs.map((club) => {
    const cv = clubVector(club);
    let s = parsed.tags.length ? cosine(qvec, cv) : 0;
    const name = club.name.toLowerCase();
    if (parsed.leftover.some((w) => name.includes(w))) s += 0.8;
    if (s > 0) s += 0.08 * cosine(uvec, cv); // tie-break toward your profile
    if (parsed.open && club.access === 'application') s *= 0.3;
    if (parsed.open && club.access === 'open') s *= 1.15;
    if (parsed.beginner && club.beginner) s *= 1.15;
    return { club, score: s };
  });
  results = results.filter((r) => r.score > 0.2).sort((a, b) => b.score - a.score);
  // A named activity (e.g. "pickleball") only counts if a club actually mentions it.
  const missing = parsed.specific.filter((w) => !results.some((r) => `${r.club.name} ${r.club.summary}`.toLowerCase().includes(w)));
  let strong = results.length > 0 && results[0].score > 0.35 && missing.length === 0;
  // Nothing direct: suggest clubs in nearby areas instead of an empty page.
  if (!results.length && parsed.tags.length) {
    const near = Object.fromEntries(parsed.tags.flatMap((t) => (RELATED[t] || []).map((r) => [r, 1])));
    results = clubs.map((club) => ({ club, score: cosine(near, clubVector(club)) + 0.05 * cosine(uvec, clubVector(club)) }))
      .filter((r) => r.score > 0.25).sort((a, b) => b.score - a.score).slice(0, 4);
    strong = false;
  }
  return { parsed, results, strong, missing };
}

// ---------- club-side: draft a profile from pasted text ----------
const CATEGORY_HINTS = {
  tech: ['software', 'ai', 'hackathons', 'quant', 'diversity'],
  engineering: ['robotics', 'aerospace', 'hardware', 'vehicles'],
  business: ['startups', 'finance', 'career', 'product'],
  creative: ['design', 'film', 'music'],
  media: ['writing'],
  service: ['service', 'mentoring'],
  sports: ['sports', 'outdoors'],
  culture: ['culture', 'language'],
};
CATEGORY_HINTS.tech.push('games');

export function draftClubProfile(name, rawText) {
  const text = rawText.toLowerCase();
  const scored = Object.entries(TAGS)
    .map(([id, t]) => [id, t.words.reduce((s, w) => s + hits(text, w), 0)])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const tags = Object.fromEntries(scored.map(([id, n], i) => [id, Math.max(0.4, Math.min(1, 1 - i * 0.15 + n * 0.05))]));
  let category = 'culture', best = -1;
  for (const [cat, list] of Object.entries(CATEGORY_HINTS)) {
    const s = list.reduce((acc, id) => acc + (tags[id] || 0), 0);
    if (s > best) { best = s; category = cat; }
  }
  const applies = /(apply|application|interview|recruit|tryout|cohort)/.test(text);
  const open = /(everyone|all (levels|majors|students)|no experience|open to|anyone|drop in|walk-?in)/.test(text);
  const access = applies && open ? 'both' : applies ? 'application' : open ? 'open' : 'ask';
  const sentences = rawText.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
  let summary = sentences[0] || '';
  if (summary.length > 150) summary = summary.slice(0, 147).replace(/\s+\S*$/, '') + '…';
  const doing = sentences.find((s, i) => i > 0 && /(we |members |you’ll|you'll|each|every)/i.test(s)) || '';
  const hook = doing ? doing.replace(/^we /i, 'You’d ').replace(/\s+/g, ' ').slice(0, 110) : 'Message us to find out what members work on.';
  const beginner = /(beginner|no experience|all levels|all majors)/.test(text);
  const flags = [];
  if (!scored.length) flags.push('Couldn’t find clear interest areas — add a sentence about what members do.');
  if (access === 'ask') flags.push('Didn’t say how to join — students will see “Ask the club.”');
  return {
    id: `custom-${Date.now()}`, name: name.trim() || 'Untitled club', category, summary, hook, tags, access,
    accessNote: access === 'both' ? 'Open membership plus a selective program.' : '', link: 'https://engage.usc.edu/',
    beginner, popularity: 1, custom: true, flags,
  };
}

// ---------- messaging helpers ----------
export function suggestOpeners(club, profile) {
  const year = profile?.year ? profile.year.toLowerCase() : 'new';
  const major = profile?.major ? ` ${profile.major}` : '';
  const { reasons } = explainMatch(club, profile, {});
  const interest = reasons[0]?.label.toLowerCase();
  const out = [];
  out.push(`Hi! I’m a ${year}${major} student${interest ? ` into ${interest}` : ''}. How can I get involved with ${club.name} this semester?`);
  if (club.access === 'application' || club.access === 'both') out.push('When does your next application cycle open, and what do you look for?');
  else out.push('When and where is your next meeting? I’d love to stop by.');
  if (!club.beginner) out.push('Is it okay to join without much experience?');
  return out;
}

export function draftOfficerReply(club, studentMsg) {
  const m = (studentMsg || '').toLowerCase();
  const parts = ['Hey, thanks for reaching out!'];
  if (/(apply|application|recruit|deadline|cycle)/.test(m) || club.access === 'application') {
    parts.push(club.access === 'open' ? 'There’s no application, just come to a meeting.' : `We recruit through an application. ${club.accessNote ? club.accessNote + ' ' : ''}I’ll send you the dates as soon as it opens.`);
  } else if (club.access === 'open' || club.access === 'both') {
    parts.push('General membership is open, so you can join anytime.');
  }
  if (/(when|where|meet|meeting|time)/.test(m)) parts.push('I’ll send our next meeting time and location here.');
  if (/(experience|beginner|new to)/.test(m)) parts.push(club.beginner ? 'No experience needed. Lots of our members started from zero.' : 'Experience helps, but we care most about interest and effort.');
  parts.push('Any other questions?');
  return parts.join(' ');
}

const BLOCK_WORDS = ['kill yourself', 'kys', 'idiot', 'stupid', 'retard', 'slut', 'whore'];
export function moderate(text) {
  const t = text.toLowerCase();
  if (BLOCK_WORDS.some((w) => hits(t, w) > 0)) return { block: 'This message looks like harassment, so it wasn’t sent. Keep it respectful.' };
  const { removed } = scrubPII(text);
  if (removed.length) return { warn: `This message includes your ${removed.map((r) => r.label).join(' and ')}. Clubs can see everything you send.` };
  return {};
}
