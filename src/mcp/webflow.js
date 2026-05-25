import path from 'node:path';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';
import { runMcpInstall } from './install.js';

const BASE_URL = 'https://mcp.webflow.com';
const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function defaultServerName() {
  const dir = path
    .basename(process.cwd())
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `webflow-${dir || 'project'}`;
}

export async function promptWebflowConfig() {
  const def = defaultServerName();

  const serverName = assertNotCancelled(
    await p.text({
      message: 'Name for the Webflow MCP server entry',
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

  p.log.warn(
    'The beta endpoint (/beta/mcp) is gated — only answer yes if you are officially enrolled in the Webflow private beta program. Otherwise the MCP will fail to connect.'
  );

  const beta = assertNotCancelled(
    await p.confirm({
      message: 'Use the Webflow MCP beta endpoint?',
      initialValue: false,
    })
  );

  return { serverName, beta };
}

export async function installWebflow({ serverName, beta }) {
  const url = `${BASE_URL}${beta ? '/beta/mcp' : '/mcp'}`;
  const display = beta ? `${serverName} (beta)` : serverName;

  await runMcpInstall({
    serverName,
    displayName: `Webflow MCP "${display}"`,
    addCommand: `claude mcp add --transport http ${serverName} ${url} -s project`,
  });
}
