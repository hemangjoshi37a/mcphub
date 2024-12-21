const fs = require('fs');
const path = require('path');

const extensionId = process.argv[2];
if (!extensionId) {
  console.error('Extension ID required');
  process.exit(1);
}

// Update web app config
const desktopAgentPath = path.join(__dirname, '..', '..', 'web', 'src', 'utils', 'desktopAgent.ts');
let desktopAgentCode = fs.readFileSync(desktopAgentPath, 'utf8');
desktopAgentCode = desktopAgentCode.replace(
  /const EXTENSION_ID = '[^']*'/,
  `const EXTENSION_ID = '${extensionId}'`
);
fs.writeFileSync(desktopAgentPath, desktopAgentCode);

console.log('Updated extension ID in web app config');
