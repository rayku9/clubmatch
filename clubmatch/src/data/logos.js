// Club logos from each club's EngageSC page (see src/assets/logos/SOURCES.json).
// Files are named {club id}.png. Clubs without a file fall back to letter initials.
const files = import.meta.glob('../assets/logos/*.png', { eager: true, query: '?url', import: 'default' });

export const LOGOS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.png', ''), url]),
);
