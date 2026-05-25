import * as p from '@clack/prompts';
import { promptWebflowConfig, installWebflow } from '../mcp/webflow.js';

export async function runWebflowEmdash() {
  const wf = await promptWebflowConfig();
  await installWebflow(wf);

  p.note(
    [
      'Commit the updated .mcp.json (project scope).',
      'Run `claude` in this directory and authenticate the Webflow MCP when prompted.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
