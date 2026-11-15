// Interest taxonomy used by the demo matching engine.
// Each tag has a label and the words/phrases that map to it.
export const TAGS = {
  ai: { label: 'AI & ML', words: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'llm', 'llms', 'neural', 'nlp', 'computer vision', 'data science', 'pytorch', 'tensorflow'] },
  software: { label: 'Software', words: ['software', 'coding', 'code', 'codes', 'programming', 'developer', 'python', 'java', 'javascript', 'typescript', 'react', 'c++', 'web', 'app', 'apps', 'full stack', 'frontend', 'backend', 'swe', 'lua'] },
  startups: { label: 'Startups', words: ['startup', 'startups', 'founder', 'founders', 'entrepreneur', 'entrepreneurship', 'incubator', 'accelerator', 'venture', 'vc'] },
  product: { label: 'Product', words: ['product', 'product management', 'product manager', 'roadmap'] },
  design: { label: 'Design & UX', words: ['design', 'designs', 'designer', 'ux', 'ui', 'figma', 'graphic', 'branding', 'visual', 'creative agency', 'illustration', 'design thinking'] },
  film: { label: 'Film & photo', words: ['photography', 'photo', 'photos', 'video', 'camera', 'editing', 'film', 'filmmaking', 'cinema', 'directing', 'short films'] },
  music: { label: 'Music', words: ['music', 'song', 'songs', 'songwriting', 'singing', 'singer', 'producer', 'producing', 'guitar', 'piano', 'band', 'radio', 'dj'] },
  writing: { label: 'Writing & media', words: ['writing', 'journalism', 'reporting', 'news', 'editor', 'newspaper', 'media', 'storytelling', 'podcast'] },
  finance: { label: 'Finance & investing', words: ['finance', 'investing', 'investment', 'stocks', 'markets', 'valuation', 'banking', 'equity', 'portfolio'] },
  quant: { label: 'Quant', words: ['quant', 'quantitative', 'trading', 'statistics', 'probability', 'math', 'mathematics'] },
  service: { label: 'Service', words: ['service', 'volunteer', 'volunteering', 'community service', 'nonprofit', 'nonprofits', 'non-profit', 'philanthropy', 'give back', 'giving back', 'social impact', 'social good'] },
  mentoring: { label: 'Mentoring & teaching', words: ['mentor', 'mentoring', 'mentorship', 'kids', 'children', 'tutoring', 'tutor', 'teaching', 'education', 'camp'] },
  robotics: { label: 'Robotics', words: ['robotics', 'robot', 'robots', 'autonomous', 'underwater', 'drone', 'embedded', 'controls'] },
  aerospace: { label: 'Aerospace', words: ['rocket', 'rockets', 'aerospace', 'propulsion', 'space', 'astronautics'] },
  hardware: { label: 'Hardware & making', words: ['hardware', 'fabrication', 'cad', 'machining', '3d printing', '3d print', 'electronics', 'maker', 'makers', 'solidworks', 'arduino', 'blender'] },
  vehicles: { label: 'Vehicles', words: ['car', 'cars', 'vehicle', 'vehicles', 'solar car', 'formula', 'hyperloop', 'transportation'] },
  sustainability: { label: 'Sustainability', words: ['sustainability', 'sustainable', 'solar', 'climate', 'clean energy', 'environment', 'environmental'] },
  outdoors: { label: 'Climbing & outdoors', words: ['climbing', 'climb', 'bouldering', 'outdoors', 'outdoor', 'hiking', 'camping', 'belay'] },
  sports: { label: 'Sports & fitness', words: ['sports', 'sport', 'fitness', 'golf', 'softball', 'athletic', 'gym', 'running', 'exercise'] },
  culture: { label: 'Culture & tradition', words: ['culture', 'cultural', 'tradition', 'tea', 'ceremony', 'japanese', 'heritage'] },
  language: { label: 'Language', words: ['linguistics', 'language', 'languages', 'grammar', 'phonetics'] },
  hackathons: { label: 'Hackathons', words: ['hackathon', 'hackathons', 'competitive programming', 'leetcode', 'codeforces'] },
  diversity: { label: 'Diversity in tech', words: ['diversity', 'underrepresented', 'women in tech', 'inclusion', 'first-gen', 'first generation'] },
  community: { label: 'Community', words: ['social', 'friends', 'friendship', 'community', 'family', 'bonding', 'meet people'] },
  career: { label: 'Career prep', words: ['career', 'recruiting', 'internship', 'internships', 'interview', 'interviews', 'resume', 'networking', 'professional'] },
  games: { label: 'Game dev', words: ['games', 'gaming', 'game dev', 'game development', 'game design', 'game jam', 'game jams', 'unity', 'unreal', 'roblox', 'esports'] },
};

export const MAJORS = [
  'computer science', 'computer engineering', 'business administration', 'economics', 'mathematics', 'applied mathematics',
  'data science', 'mechanical engineering', 'electrical engineering', 'aerospace engineering', 'biomedical engineering',
  'chemical engineering', 'civil engineering', 'industrial and systems engineering', 'biology', 'neuroscience', 'psychology',
  'journalism', 'communication', 'cinematic arts', 'film and television production', 'music', 'political science',
  'international relations', 'architecture', 'design', 'cognitive science', 'linguistics', 'accounting', 'finance',
  'philosophy', 'english', 'public policy', 'environmental studies', 'game design', 'physics', 'chemistry',
];

export const SKILLS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'lua', 'react', 'node', 'sql', 'git', 'figma', 'photoshop',
  'illustrator', 'premiere', 'excel', 'tableau', 'matlab', 'solidworks', 'cad', 'arduino', 'unity', 'unreal', 'blender',
  'pytorch', 'tensorflow', 'swift', 'kotlin', 'html', 'css', 'public speaking', 'writing', 'leadership',
];

// Skills that also hint at an interest area.
export const SKILL_TO_TAG = {
  python: 'software', java: 'software', javascript: 'software', typescript: 'software', 'c++': 'software', 'c#': 'software',
  lua: 'software', react: 'software', node: 'software', swift: 'software', kotlin: 'software', html: 'software', css: 'software',
  sql: 'software', pytorch: 'ai', tensorflow: 'ai', figma: 'design', photoshop: 'design', illustrator: 'design',
  premiere: 'film', excel: 'finance', tableau: 'quant', matlab: 'hardware', solidworks: 'hardware', cad: 'hardware',
  arduino: 'hardware', unity: 'games', unreal: 'games', blender: 'games', writing: 'writing',
};

export const GOALS = [
  { id: 'friends', label: 'Make friends', tag: 'community' },
  { id: 'skills', label: 'Build skills', tag: 'software' },
  { id: 'career', label: 'Get career-ready', tag: 'career' },
  { id: 'giveback', label: 'Give back', tag: 'service' },
  { id: 'create', label: 'Make creative work', tag: 'design' },
  { id: 'active', label: 'Stay active', tag: 'sports' },
];

export const CATEGORIES = {
  tech: { label: 'Tech', color: '#990000', ink: '#FFFFFF' },
  engineering: { label: 'Engineering', color: '#2E3A78', ink: '#FFFFFF' },
  business: { label: 'Business', color: '#1D4B57', ink: '#FFFFFF' },
  creative: { label: 'Creative', color: '#6A2C7A', ink: '#FFFFFF' },
  media: { label: 'Media', color: '#FFCC00', ink: '#231B1B' },
  service: { label: 'Service', color: '#17607F', ink: '#FFFFFF' },
  sports: { label: 'Sports & rec', color: '#2F6B35', ink: '#FFFFFF' },
  culture: { label: 'Culture', color: '#8A2F55', ink: '#FFFFFF' },
};

// Specific activities. A search for one of these only counts as a strong match
// if a club actually mentions it; otherwise it lands in the demand report.
export const SPECIFIC = {
  pickleball: 'sports', tennis: 'sports', soccer: 'sports', basketball: 'sports', volleyball: 'sports', golf: 'sports',
  softball: 'sports', swimming: 'sports', chess: 'community', cooking: 'community', baking: 'community', dance: 'music',
  'k-pop': 'music', kpop: 'music', anime: 'film', debate: 'writing', poker: 'quant', surfing: 'outdoors', hiking: 'outdoors',
};

// Nearby areas to suggest when nothing matches directly.
export const RELATED = { games: ['software', 'design', 'film'], sports: ['outdoors'], music: ['film'], culture: ['language'], community: ['service'] };
