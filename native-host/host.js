const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Buffer for reading messages
let buffer = '';

// Handle incoming messages
process.stdin.on('data', (data) => {
  buffer += data.toString();

  // Messages are preceded by their length as a 32-bit integer
  while (buffer.length >= 4) {
    const length = buffer.readUInt32LE(0);
    if (buffer.length >= length + 4) {
      const message = JSON.parse(buffer.slice(4, length + 4));
      handleMessage(message);
      buffer = buffer.slice(length + 4);
    } else {
      break;
    }
  }
});

// Send message back to the extension
function sendMessage(message) {
  const json = JSON.stringify(message);
  const buffer = Buffer.alloc(4 + json.length);
  buffer.writeUInt32LE(json.length, 0);
  buffer.write(json, 4);
  process.stdout.write(buffer);
}

// Get config file path based on OS
function getConfigPath() {
  const home = os.homedir();
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    default: // Linux and others
      return path.join(home, '.config', 'Claude', 'claude_desktop_config.json');
  }
}

// Ensure config directory exists
function ensureConfigExists() {
  const configPath = getConfigPath();
  const configDir = path.dirname(configPath);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ mcpServers: {} }, null, 2));
  }
}

// Handle incoming messages
async function handleMessage(message) {
  try {
    switch (message.type) {
      case 'GET_CONFIG':
        ensureConfigExists();
        const config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
        sendMessage({ success: true, data: config });
        break;

      case 'UPDATE_CONFIG':
        ensureConfigExists();
        fs.writeFileSync(getConfigPath(), JSON.stringify(message.config, null, 2));
        sendMessage({ success: true });
        break;

      case 'INSTALL_SERVER':
        await installServer(message.server);
        sendMessage({ success: true });
        break;

      case 'UNINSTALL_SERVER':
        await uninstallServer(message.serverName);
        sendMessage({ success: true });
        break;

      default:
        sendMessage({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    sendMessage({ success: false, error: error.message });
  }
}

// Install server using npm or pip
async function installServer(server) {
  return new Promise((resolve, reject) => {
    const command = server.runtime === 'node' ? 'npm' : 'pip';
    const args = server.runtime === 'node' 
      ? ['install', '-g', server.repository]
      : ['install', server.repository];

    const process = spawn(command, args);

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Installation failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

// Uninstall server using npm or pip
async function uninstallServer(serverName) {
  // Read config to determine runtime
  const config = JSON.parse(fs.readFileSync(getConfigPath(), 'utf8'));
  const serverConfig = config.mcpServers[serverName];

  if (!serverConfig) {
    throw new Error('Server not found in config');
  }

  return new Promise((resolve, reject) => {
    const command = serverConfig.command === 'node' ? 'npm' : 'pip';
    const args = ['uninstall', '-g', serverName];

    const process = spawn(command, args);

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Uninstallation failed with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}
