import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';
import { runMcpInstall } from './install.js';

const DEFAULT_NAME = 'chrome-devtools';
const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export async function promptChromeDevtoolsConfig() {
  const serverName = assertNotCancelled(
    await p.text({
      message: 'Name for the Chrome DevTools MCP server entry',
      placeholder: DEFAULT_NAME,
      defaultValue: DEFAULT_NAME,
      validate: (value) => {
        if (!value) return undefined;
        if (!NAME_PATTERN.test(value)) {
          return 'Use letters, digits, hyphens, underscores; must start with a letter or digit.';
        }
      },
    })
  );

  return { serverName };
}

export async function installChromeDevtools({ serverName }) {
  await runMcpInstall({
    serverName,
    displayName: `Chrome DevTools MCP "${serverName}"`,
    addCommand: `claude mcp add -s project ${serverName} npx chrome-devtools-mcp@latest`,
  });
}
