import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';

const ALREADY_EXISTS = /already exists/i;

function extractError(err) {
  const stderr = err?.stderr?.toString?.().trim() ?? '';
  const stdout = err?.stdout?.toString?.().trim() ?? '';
  return stderr || stdout;
}

export async function runMcpInstall({ serverName, displayName, addCommand }) {
  const spin = p.spinner();
  spin.start(`Registering ${displayName}`);

  try {
    execSync(addCommand, { stdio: 'pipe' });
    spin.stop(`Registered ${displayName}.`);
    return;
  } catch (err) {
    const message = extractError(err);

    if (!ALREADY_EXISTS.test(message)) {
      spin.stop(`Failed to register ${displayName}.`);
      if (message) p.log.error(message);
      throw err;
    }

    spin.stop(`An entry named "${serverName}" already exists in .mcp.json.`);
  }

  const overwrite = assertNotCancelled(
    await p.confirm({
      message: `Overwrite the existing "${serverName}" entry?`,
      initialValue: false,
    })
  );

  if (!overwrite) {
    p.log.info(`Kept existing "${serverName}" entry. Skipped ${displayName}.`);
    return;
  }

  const spin2 = p.spinner();
  spin2.start(`Replacing "${serverName}"`);
  try {
    execSync(`claude mcp remove ${serverName} -s project`, { stdio: 'pipe' });
    execSync(addCommand, { stdio: 'pipe' });
    spin2.stop(`Replaced ${displayName}.`);
  } catch (err) {
    spin2.stop(`Failed to replace ${displayName}.`);
    const message = extractError(err);
    if (message) p.log.error(message);
    throw err;
  }
}
