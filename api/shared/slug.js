// Turns a candidate name into a short, URL-safe, unique-enough slug —
// e.g. "María López García" -> "maria-lopez-garcia-a1b2". The random
// suffix avoids collisions between candidates who share a name; staff can
// still override it in the review form before publishing.

const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

function slugify(fullName) {
  const base = fullName
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

module.exports = { slugify };
