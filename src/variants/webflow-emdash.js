import * as p from '@clack/prompts';
import { promptWebflowConfig, installWebflow } from '../mcp/webflow.js';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../plugins/chrome-devtools.js';

export async function runWebflowEmdash() {
  const wf = await promptWebflowConfig();
  const cd = await promptChromeDevtoolsConfig();

  await installWebflow(wf);
  await installChromeDevtools(cd);

  p.note(
    [
      'Commit the updated .mcp.json and .claude/ entries.',
      'Run `claude` in this directory and authenticate the Webflow MCP when prompted.',
      'Restart Claude Code to activate the Chrome DevTools plugin.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
