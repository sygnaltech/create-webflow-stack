import { ensureMarketplace, installPlugin } from './install.js';

const MARKETPLACE_SOURCE = 'sygnaltech/sygnal-plugins';
const MARKETPLACE_NAME = 'sygnal-plugins';
const MARKETPLACE_DISPLAY = 'sygnaltech/sygnal-plugins';

export async function installSygnalPlugin(pluginName, { scope = 'project' } = {}) {
  await ensureMarketplace({
    source: MARKETPLACE_SOURCE,
    displayName: MARKETPLACE_DISPLAY,
    scope,
  });
  await installPlugin({
    pluginRef: `${pluginName}@${MARKETPLACE_NAME}`,
    displayName: `Sygnal plugin "${pluginName}"`,
    scope,
  });
}
