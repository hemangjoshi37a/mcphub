const fs = require('fs');
const path = require('path');

const extensionId = process.argv[2];
if (!extensionId) {
  console.error('Extension ID required');
  process.exit(1);
}

// Update native host manifest
const hostManifestPath = path.join(__dirname, '..', 'native-host', 'manifest.json');
let hostManifest = JSON.parse(fs.readFileSync(hostManifestPath, 'utf8'));

// Update host path
const hostPath = path.join(__dirname, '..', 'native-host', 'host.js');
hostManifest.path = hostPath;

// Update allowed origins
hostManifest.allowed_origins = [`chrome-extension://${extensionId}/`];

fs.writeFileSync(hostManifestPath, JSON.stringify(hostManifest, null, 2));

console.log('Updated native host manifest');
