import * as p from '@clack/prompts';
import { promptWebflowConfig, installWebflow } from '../mcp/webflow.js';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../mcp/chrome-devtools.js';

export async function runClaudeDesignToWebflow() {
  const wf = await promptWebflowConfig();
  const cd = await promptChromeDevtoolsConfig();

  await installWebflow(wf);
  await installChromeDevtools(cd);

  p.note(
    [
      'Commit the updated .mcp.json (project scope).',
      'Run `claude` in this directory and authenticate the Webflow MCP when prompted.',
      'Chrome DevTools MCP runs via `npx chrome-devtools-mcp@latest` on first use — no auth needed.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
