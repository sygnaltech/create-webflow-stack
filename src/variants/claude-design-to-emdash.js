import * as p from '@clack/prompts';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../mcp/chrome-devtools.js';

export async function runClaudeDesignToEmdash() {
  const cd = await promptChromeDevtoolsConfig();
  await installChromeDevtools(cd);

  p.note(
    [
      'Commit the updated .mcp.json (project scope).',
      'Chrome DevTools MCP runs via `npx chrome-devtools-mcp@latest` on first use — no auth needed.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
