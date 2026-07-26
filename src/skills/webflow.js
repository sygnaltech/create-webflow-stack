import { spawnSync } from 'node:child_process';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';

const WEBFLOW_SKILLS_REPO = 'webflow/webflow-skills';
// Sygnal's own skills repo (public GitHub). `npx skills add` reads skills
// straight from the repo — it does NOT need to be published to npm.
const SYGNAL_SKILLS_REPO = 'sygnaltech/webflow-skills';

function runSkillsAdd(repo, skill) {
  const args = ['skills', 'add', repo];
  if (skill) args.push('--skill', skill);
  return spawnSync('npx', args, { stdio: 'inherit', shell: true });
}

function reportResult(result, retryCmd) {
  if (result.status === 0) return true;
  if (result.status === null) {
    p.log.warn(`Skills installer was interrupted. Re-run \`${retryCmd}\` to retry.`);
  } else {
    p.log.warn(`Skills installer exited with code ${result.status}. Re-run \`${retryCmd}\` to retry.`);
  }
  return false;
}

/**
 * Install one or more Sygnal Webflow skills by name from SYGNAL_SKILLS_REPO.
 * These are the whole point of the variant, so they are installed
 * automatically — there is intentionally NO opt-out prompt. Each skill
 * installs independently.
 * @param {string[]} skills - skill names (e.g. ['webflow-mcp'])
 */
export async function installSygnalSkills(skills) {
  p.log.step(`Installing Sygnal Webflow skills (${skills.join(', ')})…`);
  for (const skill of skills) {
    const retry = `npx skills add ${SYGNAL_SKILLS_REPO} --skill ${skill}`;
    if (reportResult(runSkillsAdd(SYGNAL_SKILLS_REPO, skill), retry)) {
      p.log.success(`Installed skill: ${skill}`);
    }
  }
}

/** Offer to install the official Webflow skills set. */
export async function offerWebflowSkills() {
  const cmd = `npx skills add ${WEBFLOW_SKILLS_REPO}`;

  const install = assertNotCancelled(
    await p.confirm({
      message: `Also install the official Webflow skills? (runs \`${cmd}\` interactively)`,
      initialValue: false,
    })
  );

  if (!install) {
    p.log.info(`Skipped official Webflow skills. Run \`${cmd}\` later to install.`);
    return;
  }

  p.log.step('Launching Webflow skills installer…');
  if (reportResult(runSkillsAdd(WEBFLOW_SKILLS_REPO), cmd)) {
    p.log.success('Webflow skills installed.');
  }
}
