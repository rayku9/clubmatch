// Demo directory of real USC student organizations.
// Descriptions are short paraphrases of each club's public pages.
// Membership details are only filled in where a public source states them;
// everything else is marked 'ask' so the app never guesses.
//
// access: 'open'        -> anyone can join
//         'application' -> joining runs through an application
//         'both'        -> open general membership + a selective program
//         'ask'         -> not confirmed; message the club
// popularity: rough seed (1-10) used only for the "hidden gem" slot and demo insights.

const ENGAGE = 'https://engage.usc.edu/';
const CLUB_SPORTS = 'https://recsports.usc.edu/programs-and-classes/competitive-sports/';

export const SEED_CLUBS = [
  // ---- Tech ----
  {
    id: 'scope', name: 'Scope', category: 'tech', popularity: 9,
    summary: 'CS community where members build real projects through a semester curriculum.',
    hook: 'You’d ship an app with a small team over the semester.',
    tags: { software: 1, career: 0.6, community: 0.7 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'lavalab', name: 'LavaLab', category: 'tech', popularity: 9,
    summary: 'Student-run startup incubator: each semester a new cohort of engineers, designers, and PMs builds products and finds cofounders.',
    hook: 'You’d build a startup product with a cross-functional team.',
    tags: { startups: 1, product: 0.9, software: 0.7, design: 0.6 }, access: 'application', accessNote: 'Recruits a new cohort each semester.', link: ENGAGE,
  },
  {
    id: 'ctc', name: 'Code the Change', category: 'tech', popularity: 7,
    summary: 'Builds software for nonprofits in Los Angeles, with developers, designers, and PMs working on year-long projects.',
    hook: 'You’d write code that a real LA nonprofit uses.',
    tags: { software: 1, service: 0.9, design: 0.4, product: 0.4 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'caispp', name: 'CAIS++', category: 'tech', popularity: 6,
    summary: 'Student branch of USC’s Center for AI in Society, focused on AI for social good with the School of Social Work.',
    hook: 'You’d learn ML through a semester curriculum and apply it to social problems.',
    tags: { ai: 1, service: 0.6, software: 0.5 }, access: 'both', accessNote: 'Undergrad AI curriculum uses an application; other events are open to all.', link: 'http://caisplusplus.usc.edu/',
  },
  {
    id: 'hacksc', name: 'HackSC', category: 'tech', popularity: 8,
    summary: 'Runs USC’s hackathons, with teams in operations, partnerships, marketing, engineering, and product.',
    hook: 'You’d help put on hackathons for hundreds of students.',
    tags: { hackathons: 1, software: 0.6, community: 0.5, career: 0.3 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'acm', name: 'Association for Computing Machinery (ACM)', category: 'tech', popularity: 6,
    summary: 'USC chapter of the national computing society: workshops, talks, and a home base for CS students.',
    hook: 'You’d get technical workshops and a wide CS network.',
    tags: { software: 0.9, career: 0.6, community: 0.5 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'colorstack', name: 'ColorStack', category: 'tech', popularity: 4,
    summary: 'Supports Black and Latinx students in computing with community, academic support, and career development.',
    hook: 'You’d find community and recruiting support in tech.',
    tags: { diversity: 1, career: 0.8, software: 0.5, community: 0.6 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'openalpha', name: 'Open Alpha', category: 'tech', popularity: 3,
    summary: 'Viterbi-affiliated CS organization featured alongside Scope and LavaLab on Viterbi’s student podcast.',
    hook: 'Ask the club what this semester’s projects look like.',
    tags: { software: 0.9, community: 0.4 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'athena', name: 'Project Athena', category: 'tech', popularity: 4,
    summary: 'Viterbi organization focused on diversity and inclusion in tech, including hackathon programming.',
    hook: 'You’d help make tech spaces at USC more inclusive.',
    tags: { diversity: 1, hackathons: 0.6, software: 0.4 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'quantsc', name: 'Quant SC', category: 'tech', popularity: 5,
    summary: 'For students interested in quantitative finance: math, statistics, and trading.',
    hook: 'You’d apply math and code to markets.',
    tags: { quant: 1, finance: 0.7, software: 0.4, career: 0.4 }, access: 'ask', link: ENGAGE,
  },
  // ---- Engineering ----
  {
    id: 'rpl', name: 'Rocket Propulsion Lab', category: 'engineering', popularity: 8,
    summary: 'Student team designing, building, and launching rockets.',
    hook: 'You’d work on real flight hardware.',
    tags: { aerospace: 1, hardware: 0.8 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'auv', name: 'Autonomous Underwater Vehicle Design Team', category: 'engineering', popularity: 4,
    summary: 'Students design and build an underwater robot every year to compete in RoboSub, from planning to fabrication to testing.',
    hook: 'You’d build autonomy software or hardware for a competition robot.',
    tags: { robotics: 1, hardware: 0.7, software: 0.5, ai: 0.3 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'solarcar', name: 'SC Solar Car', category: 'engineering', popularity: 4,
    summary: 'Design team building a solar-powered race car.',
    hook: 'You’d build a car that runs on sunlight.',
    tags: { vehicles: 1, sustainability: 0.8, hardware: 0.7 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'hyperloop', name: 'USC Hyperloop', category: 'engineering', popularity: 5,
    summary: 'Builds a hyperloop pod, working with SpaceX engineers on performance and safety requirements.',
    hook: 'You’d get engineering experience with industry exposure.',
    tags: { vehicles: 1, hardware: 0.8, career: 0.4 }, access: 'open', accessNote: 'Open to everyone; sign up on their site.', link: 'http://uschyperloop.com', beginner: true,
  },
  {
    id: '3d4e', name: '3D For Everyone (3D4E)', category: 'engineering', popularity: 3,
    summary: 'Gets students of every major into 3D printing and design, with projects that give back.',
    hook: 'You’d learn to design and print things, no experience needed.',
    tags: { hardware: 1, design: 0.5, service: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'makers', name: 'Makers', category: 'engineering', popularity: 3,
    summary: 'Viterbi organization for students who like to build things by hand.',
    hook: 'You’d tinker on hands-on builds with other makers.',
    tags: { hardware: 1, community: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  // ---- Business ----
  {
    id: 'troylabs', name: 'Troy Labs', category: 'business', popularity: 8,
    summary: 'Startup accelerator club with a general program and a selective program for student founders.',
    hook: 'You’d join a community of student founders and builders.',
    tags: { startups: 1, product: 0.5, career: 0.5, community: 0.4 }, access: 'both', accessNote: 'General program plus a selective program.', link: ENGAGE,
  },
  {
    id: 'sparksc', name: 'Spark SC', category: 'business', popularity: 5,
    summary: 'Entrepreneurship club behind initiatives like a startup career fair and fellowships with LA startups.',
    hook: 'You’d connect with LA’s startup scene.',
    tags: { startups: 1, career: 0.8 }, access: 'ask', link: ENGAGE,
  },
  {
    id: 'tis', name: 'Trojan Investing Society', category: 'business', popularity: 7,
    summary: 'Finance club for learning to invest, with a general member program.',
    hook: 'You’d learn to research and pitch stocks.',
    tags: { finance: 1, career: 0.6, quant: 0.3 }, access: 'both', accessNote: 'Has a general program; ask about selective tracks.', link: ENGAGE, beginner: true,
  },
  {
    id: 'siliconbeach', name: 'Silicon Beach Club', category: 'business', popularity: 3,
    summary: 'Connects USC students with tech companies in LA’s Silicon Beach.',
    hook: 'You’d meet people at LA tech companies.',
    tags: { career: 1, startups: 0.6 }, access: 'ask', link: ENGAGE,
  },
  // ---- Creative ----
  {
    id: 'innod', name: 'Innovative Design', category: 'creative', popularity: 9,
    summary: 'Student-run creative agency of designers, photographers, and web developers who take on client work each semester.',
    hook: 'You’d do design, photo, or web work for real clients.',
    tags: { design: 1, film: 0.6, software: 0.4 }, access: 'application', accessNote: 'Multi-round application.', link: ENGAGE,
  },
  {
    id: 'dfa', name: 'Design for America', category: 'creative', popularity: 4,
    summary: 'Social-impact design studio that teaches design thinking through community projects.',
    hook: 'You’d use design to tackle a community problem.',
    tags: { design: 1, service: 0.7, product: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'tfc', name: 'Trojan Filmmakers Club', category: 'creative', popularity: 6,
    summary: 'Student filmmakers making short films together.',
    hook: 'You’d write, shoot, or edit a short film.',
    tags: { film: 1, writing: 0.4, community: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'songwriters', name: 'USC Songwriters Forum', category: 'creative', popularity: 3,
    summary: 'For singers, songwriters, producers, instrumentalists, and anyone who makes music at USC.',
    hook: 'You’d share and workshop songs with other musicians.',
    tags: { music: 1, community: 0.5 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  // ---- Media ----
  {
    id: 'dailytrojan', name: 'Daily Trojan', category: 'media', popularity: 8,
    summary: 'USC’s independent student newspaper, run entirely by students; welcomes every major.',
    hook: 'You’d report, edit, photograph, or design for campus news.',
    tags: { writing: 1, film: 0.4, design: 0.3 }, access: 'open', accessNote: 'Welcomes students of all majors and experience levels.', link: 'https://dailytrojan.com/apply', beginner: true,
  },
  {
    id: 'kxsc', name: 'KXSC Radio', category: 'media', popularity: 5,
    summary: 'USC’s student-run radio station.',
    hook: 'You’d host a show or help run the station.',
    tags: { music: 1, writing: 0.4, community: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  // ---- Service ----
  {
    id: 'troycamp', name: 'Troy Camp', category: 'service', popularity: 9,
    summary: 'USC’s oldest student-run philanthropy, mentoring kids from the South LA community from elementary school through high school.',
    hook: 'You’d build a long-term mentoring relationship with a local kid.',
    tags: { mentoring: 1, service: 0.9, community: 0.6 }, access: 'application', accessNote: 'Counselors go through an application and interview.', link: ENGAGE,
  },
  {
    id: 'apo', name: 'Alpha Phi Omega', category: 'service', popularity: 7,
    summary: 'Co-ed national service fraternity built around community service and friendship.',
    hook: 'You’d volunteer regularly with a close group.',
    tags: { service: 1, community: 0.8 }, access: 'ask', accessNote: 'Has a recruitment process; ask for dates.', link: ENGAGE,
  },
  // ---- Sports & rec ----
  {
    id: 'climbing', name: 'Climbing Club', category: 'sports', popularity: 7,
    summary: 'Inclusive climbing community with twice-weekly practices at a climbing gym and weekend outdoor trips; beginners welcome.',
    hook: 'You’d learn to climb safely and get certified.',
    tags: { outdoors: 1, sports: 0.7, community: 0.6 }, access: 'open', accessNote: 'All levels welcome; semester dues.', link: CLUB_SPORTS, beginner: true,
  },
  {
    id: 'clubgolf', name: 'Club Golf', category: 'sports', popularity: 3,
    summary: 'USC club sport for golfers who want to keep playing and compete against other schools.',
    hook: 'You’d keep playing golf competitively.',
    tags: { sports: 1, community: 0.3 }, access: 'ask', link: CLUB_SPORTS,
  },
  {
    id: 'clubsoftball', name: 'Club Softball', category: 'sports', popularity: 3,
    summary: 'USC club softball team with regular practices and intercollegiate games.',
    hook: 'You’d play on a team without D1-level commitment.',
    tags: { sports: 1, community: 0.5 }, access: 'ask', link: CLUB_SPORTS,
  },
  // ---- Culture ----
  {
    id: 'chanoyu', name: 'Chanoyu Tea Club', category: 'culture', popularity: 2,
    summary: 'Explores the Japanese tea ceremony and its traditions.',
    hook: 'You’d learn a centuries-old practice in a calm setting.',
    tags: { culture: 1, community: 0.5 }, access: 'ask', link: ENGAGE, beginner: true,
  },
  {
    id: 'usil', name: 'USiL (Linguistics)', category: 'culture', popularity: 2,
    summary: 'Student-run organization for anyone curious about linguistics and language.',
    hook: 'You’d nerd out about how language works.',
    tags: { language: 1, community: 0.4 }, access: 'ask', link: ENGAGE, beginner: true,
  },
];
