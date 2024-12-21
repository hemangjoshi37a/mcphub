// Native messaging host name
const hostName = 'com.mcphub.agent';

// Config file path management
const configPaths = {
  windows: '%APPDATA%\\Claude\\claude_desktop_config.json',
  macos: '~/Library/Application Support/Claude/claude_desktop_config.json',
  linux: '~/.config/Claude/claude_desktop_config.json'
};

// Connect to native messaging host
let port = null;

function connectNativeHost() {
  port = chrome.runtime.connectNative(hostName);
  
  port.onMessage.addListener((msg) => {
    console.log('Received from native host:', msg);
  });

  port.onDisconnect.addListener(() => {
    console.log('Disconnected from native host');
    port = null;
  });
}

// Handle messages from the web app
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    if (!port) {
      connectNativeHost();
    }

    switch (request.type) {
      case 'GET_CONFIG':
        try {
          const config = await getConfig();
          sendResponse({ success: true, data: config });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'UPDATE_CONFIG':
        try {
          await updateConfig(request.config);
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'INSTALL_SERVER':
        try {
          await installServer(request.server);
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'UNINSTALL_SERVER':
        try {
          await uninstallServer(request.serverName);
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      default:
        sendResponse({ success: false, error: 'Unknown request type' });
    }
    return true; // Required for async response
  }
);

async function getConfig() {
  return new Promise((resolve, reject) => {
    port.postMessage({ type: 'GET_CONFIG' });
    port.onMessage.addListener(function listener(response) {
      port.onMessage.removeListener(listener);
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

async function updateConfig(config) {
  return new Promise((resolve, reject) => {
    port.postMessage({ type: 'UPDATE_CONFIG', config });
    port.onMessage.addListener(function listener(response) {
      port.onMessage.removeListener(listener);
      if (response.success) {
        resolve();
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

async function installServer(server) {
  return new Promise((resolve, reject) => {
    port.postMessage({ type: 'INSTALL_SERVER', server });
    port.onMessage.addListener(function listener(response) {
      port.onMessage.removeListener(listener);
      if (response.success) {
        resolve();
      } else {
        reject(new Error(response.error));
      }
    });
  });
}

async function uninstallServer(serverName) {
  return new Promise((resolve, reject) => {
    port.postMessage({ type: 'UNINSTALL_SERVER', serverName });
    port.onMessage.addListener(function listener(response) {
      port.onMessage.removeListener(listener);
      if (response.success) {
        resolve();
      } else {
        reject(new Error(response.error));
      }
    });
  });
}
