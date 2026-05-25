import * as p from '@clack/prompts';
import { ensureClaudeInstalled } from './checks.js';
import { assertNotCancelled } from './util/cancel.js';
import { runWebflowEmdash } from './variants/webflow-emdash.js';
import { runClaudeDesignToWebflow } from './variants/claude-design-to-webflow.js';
import { runClaudeDesignToEmdash } from './variants/claude-design-to-emdash.js';

const VARIANTS = [
  {
    value: 'webflow-emdash',
    label: 'Webflow → EmDash migration',
    hint: 'Webflow MCP for porting an existing Webflow site into an EmDash project',
    run: runWebflowEmdash,
  },
  {
    value: 'claude-design-to-webflow',
    label: 'Claude Design → Webflow',
    hint: 'Webflow MCP + Chrome DevTools MCP for converting a Claude Design prototype into a Webflow site',
    run: runClaudeDesignToWebflow,
  },
  {
    value: 'claude-design-to-emdash',
    label: 'Claude Design → EmDash',
    hint: 'Chrome DevTools MCP for converting a Claude Design prototype into an EmDash site',
    run: runClaudeDesignToEmdash,
  },
];

export async function run() {
  p.intro('create-sygnal-stack');

  ensureClaudeInstalled();

  const variantValue = assertNotCancelled(
    await p.select({
      message: 'Pick a scaffolding variant',
      options: VARIANTS.map(({ value, label, hint }) => ({ value, label, hint })),
    })
  );

  const variant = VARIANTS.find((v) => v.value === variantValue);
  p.log.step(`Variant: ${variant.label}`);

  await variant.run();

  p.outro('Done.');
}
