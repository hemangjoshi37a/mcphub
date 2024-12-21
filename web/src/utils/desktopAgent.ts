const EXTENSION_ID = 'EXTENSION_ID_HERE'; // Replace with your extension ID after publishing

export async function checkExtension() {
  try {
    if (!chrome?.runtime?.sendMessage) {
      throw new Error('Chrome extension API not available');
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function getConfig() {
  try {
    const response = await chrome.runtime.sendMessage(EXTENSION_ID, { type: 'GET_CONFIG' });
    if (!response.success) {
      throw new Error(response.error);
    }
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get config: ${error.message}`);
  }
}

export async function updateConfig(config: any) {
  try {
    const response = await chrome.runtime.sendMessage(EXTENSION_ID, { 
      type: 'UPDATE_CONFIG',
      config 
    });
    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error: any) {
    throw new Error(`Failed to update config: ${error.message}`);
  }
}

export async function installServer(server: any) {
  try {
    const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
      type: 'INSTALL_SERVER',
      server
    });
    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error: any) {
    throw new Error(`Failed to install server: ${error.message}`);
  }
}

export async function uninstallServer(serverName: string) {
  try {
    const response = await chrome.runtime.sendMessage(EXTENSION_ID, {
      type: 'UNINSTALL_SERVER',
      serverName
    });
    if (!response.success) {
      throw new Error(response.error);
    }
  } catch (error: any) {
    throw new Error(`Failed to uninstall server: ${error.message}`);
  }
}
