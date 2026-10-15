import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { ensureGitignored } from '../util/gitignore.js';
import { runMcpInstall } from './install.js';

// Pinned on purpose. The generated .mcp.json is committed, so every machine on
// the project launches the same server build. Bump this constant — and re-check
// the flags below against that release — to move the whole team at once.
//
// Flag notes as of 1.10.1:
//   --categoryExtensions   opt-in; adds the extension tools (needs a pipe
//                          connection, which is how the server launches Chrome)
//   --userDataDir          arbitrary path, handed straight to Chrome's
//                          --user-data-dir. The server only creates this
//                          directory when the flag is ABSENT, so we create it.
//   --viewport             WxH, applied to Chrome instances the server starts
// `--experimentalPageIdRouting` was removed after 1.3.0; page-ID routing is now
// `--pageIdRouting`, on by default, so it is deliberately not passed here.
export const CHROME_DEVTOOLS_MCP_VERSION = '1.10.1';

/**
 * The profile always lives in the project. Chrome refuses to run two instances
 * against one user-data directory, and one profile per project directory makes
 * that unique by construction — so there is nothing to name and nothing to ask.
 */
export const PROJECT_PROFILE_DIR = '.chrome-profile';

const SERVER_NAME = 'chrome-devtools';
const VIEWPORT = '1440x900';

/**
 * Quote a single argv token for the shell `execSync` runs. Windows project
 * paths routinely contain spaces, and the whole `--userDataDir=<path>` token
 * has to survive as one argument.
 */
function quote(token) {
  return /[\s"']/.test(token) ? `"${token.replace(/"/g, '\\"')}"` : token;
}

export async function installChromeDevtools() {
  const userDataDir = path.join(process.cwd(), PROJECT_PROFILE_DIR);

  // The server only mkdirs the profile when --userDataDir is omitted, so make
  // it ourselves rather than relying on Chrome to create a missing path.
  fs.mkdirSync(userDataDir, { recursive: true });

  ensureGitignored(`${PROJECT_PROFILE_DIR}/`, {
    comment: '# Chrome DevTools MCP browser profile (machine-local)',
  });

  const args = [
    '-y',
    `chrome-devtools-mcp@${CHROME_DEVTOOLS_MCP_VERSION}`,
    '--categoryExtensions',
    `--userDataDir=${userDataDir}`,
    `--viewport=${VIEWPORT}`,
  ];

  await runMcpInstall({
    serverName: SERVER_NAME,
    displayName: `Chrome DevTools MCP "${SERVER_NAME}"`,
    addCommand: `claude mcp add -s project ${SERVER_NAME} -- npx ${args
      .map(quote)
      .join(' ')}`,
  });

  p.log.info(`Chrome profile: ${PROJECT_PROFILE_DIR}/ (gitignored)`);
}
