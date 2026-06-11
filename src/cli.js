import * as p from '@clack/prompts';
import { ensureClaudeInstalled } from './checks.js';
import { assertNotCancelled } from './util/cancel.js';
import { runWebflow } from './variants/webflow.js';
import { runWebflowToWebflow } from './variants/webflow-to-webflow.js';
import { runClaudeDesignToWebflow } from './variants/claude-design-to-webflow.js';

const VARIANTS = [
  {
    value: 'webflow',
    label: 'Webflow',
    hint: 'Webflow MCP only — base setup for Webflow work',
    run: runWebflow,
  },
  {
    value: 'webflow-to-webflow',
    label: 'Webflow → Webflow migration',
    hint: 'Two Webflow MCP entries (-source and -dest) for migrating between Webflow sites',
    run: runWebflowToWebflow,
  },
  {
    value: 'claude-design-to-webflow',
    label: 'Claude Design → Webflow',
    hint: 'Webflow MCP + Chrome DevTools MCP for converting a Claude Design prototype into a Webflow site',
    run: runClaudeDesignToWebflow,
  },
];

export async function run() {
  p.intro('create-webflow-stack');

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
