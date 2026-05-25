import { ensureMarketplace, installPlugin } from './install.js';

const MARKETPLACE_SOURCE = 'ChromeDevTools/chrome-devtools-mcp';
const PLUGIN_REF = 'chrome-devtools-mcp@chrome-devtools-plugins';
const DISPLAY_NAME = 'Chrome DevTools plugin';

export async function promptChromeDevtoolsConfig() {
  return {};
}

export async function installChromeDevtools(_config = {}) {
  await ensureMarketplace({
    source: MARKETPLACE_SOURCE,
    displayName: 'ChromeDevTools/chrome-devtools-mcp',
    scope: 'project',
  });
  await installPlugin({
    pluginRef: PLUGIN_REF,
    displayName: DISPLAY_NAME,
    scope: 'project',
  });
}
