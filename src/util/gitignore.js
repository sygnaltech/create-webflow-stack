import fs from 'node:fs';
import path from 'node:path';

/**
 * Append an entry to the project's .gitignore if it isn't already ignored.
 * Creates the file when missing. Matching is line-exact (ignoring a trailing
 * slash), not a full gitignore-semantics evaluation — enough to avoid writing
 * the same entry twice on a re-run.
 *
 * @param {string} entry - the pattern to add, e.g. '.chrome-profile/'
 * @param {object} [opts]
 * @param {string} [opts.comment] - comment line written above a new entry
 * @param {string} [opts.cwd] - project root (defaults to process.cwd())
 * @returns {boolean} true if the entry was added, false if already present
 */
export function ensureGitignored(entry, { comment, cwd = process.cwd() } = {}) {
  const file = path.join(cwd, '.gitignore');

  let current = '';
  try {
    current = fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const bare = entry.replace(/\/+$/, '');
  const present = current
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => line === bare || line === `${bare}/` || line === `/${bare}`);

  if (present) return false;

  // Keep a blank line between whatever was there and what we add, and never
  // glue our entry onto an unterminated final line.
  const prefix = current === '' ? '' : current.endsWith('\n') ? '\n' : '\n\n';
  const block = comment ? `${comment}\n${entry}\n` : `${entry}\n`;

  fs.appendFileSync(file, `${prefix}${block}`);
  return true;
}
