import * as p from '@clack/prompts';
import { promptWebflowConfig, installWebflow } from '../mcp/webflow.js';
import { installChromeDevtools } from '../mcp/chrome-devtools.js';
import { installSygnalSkills, offerWebflowSkills } from '../skills/webflow.js';

export async function runClaudeDesignToWebflow() {
  const wf = await promptWebflowConfig();

  await installWebflow(wf);
  await installChromeDevtools();
  await installSygnalSkills(['webflow-mcp', 'claude-design-to-webflow']);
  await offerWebflowSkills();

  p.note(
    [
      'Commit the updated .mcp.json, .claude/, and .gitignore entries.',
      'Run `claude` in this directory and authenticate the Webflow MCP when prompted.',
      'Restart Claude Code so it picks up the Chrome DevTools MCP server.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
