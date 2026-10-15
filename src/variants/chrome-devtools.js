import * as p from '@clack/prompts';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../mcp/chrome-devtools.js';

export async function runChromeDevtools() {
  const cd = await promptChromeDevtoolsConfig();

  await installChromeDevtools(cd);

  p.note(
    [
      'Commit the updated .mcp.json (and .gitignore, if the profile is in-project).',
      'Restart Claude Code so it picks up the new MCP server.',
      'The browser profile is machine-local and is never committed — each clone builds its own on first launch.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
