import { execSync } from 'node:child_process';
import * as p from '@clack/prompts';
import { assertNotCancelled } from '../util/cancel.js';

const MARKETPLACE_EXISTS = /already\s+(added|exists|configured|registered)/i;
const PLUGIN_INSTALLED = /already\s+installed/i;

function extractError(err) {
  const stderr = err?.stderr?.toString?.().trim() ?? '';
  const stdout = err?.stdout?.toString?.().trim() ?? '';
  return stderr || stdout;
}

function bareName(pluginRef) {
  return pluginRef.split('@')[0];
}

export async function ensureMarketplace({ source, displayName, scope = 'project' }) {
  const spin = p.spinner();
  spin.start(`Registering marketplace ${displayName} (${scope} scope)`);
  try {
    execSync(`claude plugin marketplace add --scope ${scope} ${source}`, {
      stdio: 'pipe',
    });
    spin.stop(`Registered marketplace ${displayName} (${scope} scope).`);
    return;
  } catch (err) {
    const message = extractError(err);
    if (MARKETPLACE_EXISTS.test(message)) {
      spin.stop(`Marketplace ${displayName} already registered.`);
      return;
    }
    spin.stop(`Failed to register marketplace ${displayName}.`);
    if (message) p.log.error(message);
    throw err;
  }
}

export async function installPlugin({ pluginRef, displayName, scope = 'project' }) {
  const spin = p.spinner();
  spin.start(`Installing ${displayName} (${scope} scope)`);
  try {
    execSync(`claude plugin install ${pluginRef} -s ${scope}`, { stdio: 'pipe' });
    spin.stop(`Installed ${displayName} (${scope} scope).`);
    return;
  } catch (err) {
    const message = extractError(err);

    if (!PLUGIN_INSTALLED.test(message)) {
      spin.stop(`Failed to install ${displayName}.`);
      if (message) p.log.error(message);
      throw err;
    }

    spin.stop(`${displayName} is already installed at ${scope} scope.`);
  }

  const reinstall = assertNotCancelled(
    await p.confirm({
      message: `Reinstall ${displayName}?`,
      initialValue: false,
    })
  );

  if (!reinstall) {
    p.log.info(`Kept existing install of ${displayName}.`);
    return;
  }

  const spin2 = p.spinner();
  spin2.start(`Reinstalling ${displayName}`);
  try {
    execSync(`claude plugin uninstall ${bareName(pluginRef)} -s ${scope}`, {
      stdio: 'pipe',
    });
    execSync(`claude plugin install ${pluginRef} -s ${scope}`, { stdio: 'pipe' });
    spin2.stop(`Reinstalled ${displayName}.`);
  } catch (err) {
    spin2.stop(`Failed to reinstall ${displayName}.`);
    const message = extractError(err);
    if (message) p.log.error(message);
    throw err;
  }
}
