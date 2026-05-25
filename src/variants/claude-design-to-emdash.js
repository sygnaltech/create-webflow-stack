import * as p from '@clack/prompts';
import {
  promptChromeDevtoolsConfig,
  installChromeDevtools,
} from '../plugins/chrome-devtools.js';

export async function runClaudeDesignToEmdash() {
  const cd = await promptChromeDevtoolsConfig();
  await installChromeDevtools(cd);

  p.note(
    [
      'Commit the .claude/ entries created by the install.',
      'Restart Claude Code to activate the Chrome DevTools plugin.',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
