import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';
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

/** Profile directory created inside the project when the profile is kept local. */
export const PROJECT_PROFILE_DIR = '.chrome-profile';

const DEFAULT_SERVER_NAME = 'chrome-devtools';
const DEFAULT_VIEWPORT = '1440x900';
const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const VIEWPORT_PATTERN = /^[1-9]\d{1,4}x[1-9]\d{1,4}$/;

function slugFromCwd() {
  return (
    path
      .basename(process.cwd())
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project'
  );
}

/** Where a named profile lives when kept outside the project, on this machine. */
function sharedProfilePath(profileName) {
  return path.join(
    os.homedir(),
    '.cache',
    'chrome-devtools-mcp',
    'profiles',
    profileName
  );
}

/**
 * Quote a single argv token for the shell `execSync` runs. Windows project
 * paths routinely contain spaces, and the whole `--userDataDir=<path>` token
 * has to survive as one argument.
 */
function quote(token) {
  return /[\s"']/.test(token) ? `"${token.replace(/"/g, '\\"')}"` : token;
}

export async function promptChromeDevtoolsConfig() {
  const serverName = assertNotCancelled(
    await p.text({
      message: 'Name for the Chrome DevTools MCP server entry',
      placeholder: DEFAULT_SERVER_NAME,
      defaultValue: DEFAULT_SERVER_NAME,
      validate: (value) => {
        if (!value) return undefined;
        if (!NAME_PATTERN.test(value)) {
          return 'Use letters, digits, hyphens, underscores; must start with a letter or digit.';
        }
      },
    })
  );

  p.log.info(
    'Chrome refuses to run two instances against one profile, so each project needs its own. Keeping it in the project makes that automatic.'
  );

  const location = assertNotCancelled(
    await p.select({
      message: 'Where should this project’s Chrome profile live?',
      options: [
        {
          value: 'project',
          label: `In the project (./${PROJECT_PROFILE_DIR})`,
          hint: 'unique by construction, added to .gitignore, deleted with the project',
        },
        {
          value: 'shared',
          label: '~/.cache/chrome-devtools-mcp/profiles/<name>',
          hint: 'survives a clean clone; you pick a name that stays unique',
        },
      ],
      initialValue: 'project',
    })
  );

  let userDataDir;
  if (location === 'project') {
    userDataDir = path.join(process.cwd(), PROJECT_PROFILE_DIR);
  } else {
    const def = slugFromCwd();
    const profileName = assertNotCancelled(
      await p.text({
        message: 'Profile name (must be unique across all your projects)',
        placeholder: def,
        defaultValue: def,
        validate: (value) => {
          if (!value) return undefined;
          if (!NAME_PATTERN.test(value)) {
            return 'Use letters, digits, hyphens, underscores; must start with a letter or digit.';
          }
        },
      })
    );
    userDataDir = sharedProfilePath(profileName);
  }

  const viewport = assertNotCancelled(
    await p.text({
      message: 'Initial browser viewport (WxH)',
      placeholder: DEFAULT_VIEWPORT,
      defaultValue: DEFAULT_VIEWPORT,
      validate: (value) => {
        if (!value) return undefined;
        if (!VIEWPORT_PATTERN.test(value)) {
          return 'Expected the format 1440x900.';
        }
      },
    })
  );

  return { serverName, userDataDir, inProject: location === 'project', viewport };
}

export async function installChromeDevtools({
  serverName,
  userDataDir,
  inProject,
  viewport,
}) {
  // The server only mkdirs the profile when --userDataDir is omitted, so make
  // it ourselves rather than relying on Chrome to create a missing path.
  fs.mkdirSync(userDataDir, { recursive: true });

  if (inProject) {
    const added = ensureGitignored(`${PROJECT_PROFILE_DIR}/`, {
      comment: '# Chrome DevTools MCP browser profile (machine-local)',
    });
    p.log.info(
      added
        ? `Added ${PROJECT_PROFILE_DIR}/ to .gitignore.`
        : `${PROJECT_PROFILE_DIR}/ is already covered by .gitignore.`
    );
  }

  const args = [
    '-y',
    `chrome-devtools-mcp@${CHROME_DEVTOOLS_MCP_VERSION}`,
    '--categoryExtensions',
    `--userDataDir=${userDataDir}`,
    `--viewport=${viewport}`,
  ];

  await runMcpInstall({
    serverName,
    displayName: `Chrome DevTools MCP "${serverName}"`,
    addCommand: `claude mcp add -s project ${serverName} -- npx ${args
      .map(quote)
      .join(' ')}`,
  });

  p.log.info(`Chrome profile: ${userDataDir}`);
}
