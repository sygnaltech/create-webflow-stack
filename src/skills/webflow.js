import { spawnSync } from 'node:child_process';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';

const SKILLS_REPO = 'webflow/webflow-skills';
const COMMAND = `npx skills add ${SKILLS_REPO}`;

export async function offerWebflowSkills() {
  const install = assertNotCancelled(
    await p.confirm({
      message: `Install Webflow skills now? (runs \`${COMMAND}\` interactively)`,
      initialValue: true,
    })
  );

  if (!install) {
    p.log.info(`Skipped Webflow skills. Run \`${COMMAND}\` later to install.`);
    return;
  }

  p.log.step('Launching Webflow skills installer…');
  const result = spawnSync('npx', ['skills', 'add', SKILLS_REPO], {
    stdio: 'inherit',
    shell: true,
  });

  if (result.status === 0) {
    p.log.success('Webflow skills installed.');
    return;
  }

  if (result.status === null) {
    p.log.warn(`Webflow skills installer was interrupted. Re-run \`${COMMAND}\` to retry.`);
    return;
  }

  p.log.warn(
    `Webflow skills installer exited with code ${result.status}. Re-run \`${COMMAND}\` to retry.`
  );
}
