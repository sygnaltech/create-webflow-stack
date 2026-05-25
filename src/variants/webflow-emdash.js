import * as p from '@clack/prompts';
import { promptWebflowConfig, installWebflow } from '../mcp/webflow.js';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../plugins/chrome-devtools.js';
import { installSygnalPlugin } from '../plugins/sygnal.js';
import { promptDevVarsConfig, installDevVars } from '../files/dev-vars.js';

export async function runWebflowEmdash() {
  const wf = await promptWebflowConfig();
  const cd = await promptChromeDevtoolsConfig();
  const dv = await promptDevVarsConfig();

  await installWebflow(wf);
  await installChromeDevtools(cd);
  await installSygnalPlugin('webflow-emdash');
  await installDevVars(dv);

  p.note(
    [
      'Commit the updated .mcp.json, .claude/, and .dev.vars.example entries.',
      '.dev.vars contains a generated encryption key — back it up; it must match production.',
      'Run `claude` in this directory and authenticate the Webflow MCP when prompted.',
      'Restart Claude Code to activate the Chrome DevTools and Sygnal webflow-emdash plugins.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
