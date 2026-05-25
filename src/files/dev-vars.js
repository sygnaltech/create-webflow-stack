import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as p from '@clack/prompts';

/**
 * Project-file generator for `.dev.vars` and `.dev.vars.example`.
 *
 * `.dev.vars.example` is the committed template — operators copy it and fill in
 * real values. We refresh it on every scaffolder run so the comment block stays
 * up to date as conventions evolve.
 *
 * `.dev.vars` is the gitignored real file used by `wrangler dev`. We only write
 * it on first scaffold (never overwrite — would stomp operator state). We
 * pre-fill `EMDASH_ENCRYPTION_KEY` with a freshly generated valid key so the
 * dev environment boots cleanly without manual setup. OAuth values are left
 * blank for the operator to paste in when ready.
 *
 * Both files are written at the cwd (the project root the scaffolder is
 * running in), matching the convention used by the MCP and plugin installers.
 */

const EXAMPLE_FILE = '.dev.vars.example';
const REAL_FILE = '.dev.vars';

const DEV_VARS_TEMPLATE = `# EmDash encryption key. Encrypts plugin secrets (and other site-level
# sensitive data) at rest in D1. Operator-provided; never stored in the DB.
# Losing it means losing every secret encrypted with it, so back it up
# wherever you keep prod secrets.
#
# Format: emdash_enc_v1_<43 base64url chars> (32 random bytes encoded).
# Generate with:
#   node -e "console.log('emdash_enc_v1_' + require('crypto').randomBytes(32).toString('base64url'))"
#
# Use the SAME value in production via:
#   wrangler secret put EMDASH_ENCRYPTION_KEY
# (Rotating in prod invalidates all existing encrypted values until a
# multi-key rotation policy is configured.)
EMDASH_ENCRYPTION_KEY=

# Google OAuth 2.0 client credentials. Used by the EmDash admin sign-in.
# Get them from: Google Cloud Console -> APIs & Services -> Credentials ->
#   OAuth 2.0 Client IDs -> (your client).
# Whitelist these redirect URIs on the same OAuth client:
#   https://localhost.sygnal.com/_emdash/api/auth/oauth/google/callback   (local dev)
#   https://<your-prod-domain>/_emdash/api/auth/oauth/google/callback     (production)
# In prod, set these via \`wrangler secret put\`. See EMDASH-ADMIN-SETUP.md
# and GOOGLE-OAUTH.md for the full flow.
EMDASH_OAUTH_GOOGLE_CLIENT_ID=
EMDASH_OAUTH_GOOGLE_CLIENT_SECRET=
`;

function generateEncryptionKey() {
  // 32 random bytes → 43 char unpadded base64url → matches EmDash's
  // ENCRYPTION_KEY_PATTERN = /^emdash_enc_v1_[A-Za-z0-9_-]{43}$/.
  return `emdash_enc_v1_${crypto.randomBytes(32).toString('base64url')}`;
}

export async function promptDevVarsConfig() {
  // No interactive input today. Returned for symmetry with sibling installers
  // so variants compose them uniformly.
  return {};
}

export async function installDevVars(_config = {}) {
  const cwd = process.cwd();

  // .dev.vars.example: refresh unconditionally — it's a template, no operator
  // state to preserve, and the comment block evolves with the scaffolder.
  const examplePath = path.join(cwd, EXAMPLE_FILE);
  fs.writeFileSync(examplePath, DEV_VARS_TEMPLATE, 'utf8');
  p.log.info(`Wrote ${EXAMPLE_FILE} (template, committed)`);

  // .dev.vars: only on first scaffold. Never overwrite — operator may already
  // have the prod-matching key in there.
  const realPath = path.join(cwd, REAL_FILE);
  if (fs.existsSync(realPath)) {
    p.log.warn(`${REAL_FILE} already exists — leaving it untouched`);
    return;
  }

  const key = generateEncryptionKey();
  const realContent = DEV_VARS_TEMPLATE.replace(
    'EMDASH_ENCRYPTION_KEY=',
    `EMDASH_ENCRYPTION_KEY=${key}`
  );
  fs.writeFileSync(realPath, realContent, 'utf8');
  p.log.info(`Wrote ${REAL_FILE} (gitignored, encryption key generated)`);
  p.log.warn(
    `Back this up: the generated EMDASH_ENCRYPTION_KEY must match production.\n` +
      `  ${key}`
  );
}
