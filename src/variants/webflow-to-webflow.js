import path from 'node:path';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';
import { installWebflow } from '../mcp/webflow.js';
import { offerWebflowSkills } from '../skills/webflow.js';

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function defaultBaseName() {
  const dir = path
    .basename(process.cwd())
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `webflow-${dir || 'project'}`;
}

export async function runWebflowToWebflow() {
  const def = defaultBaseName();

  const baseName = assertNotCancelled(
    await p.text({
      message:
        'Base name for the Webflow MCP server entries (suffixes -source and -dest will be appended)',
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
      message: 'Use the Webflow MCP beta endpoint for both entries?',
      initialValue: false,
    })
  );

  await installWebflow({ serverName: `${baseName}-source`, beta });
  await installWebflow({ serverName: `${baseName}-dest`, beta });
  await offerWebflowSkills();

  p.note(
    [
      'Commit the updated .mcp.json entries.',
      'Run `claude` in this directory and authenticate the -source and -dest Webflow MCP entries separately (one for each Webflow account/site).',
    ]
      .map((line) => `• ${line}`)
      .join('\n'),
    "What's next"
  );
}
