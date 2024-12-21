const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read public key from manifest
const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'manifest.json'),
  'utf8'
));

// Generate extension ID from public key
const hash = crypto.createHash('sha256');
hash.update(manifest.key);
const id = hash.digest('hex').slice(0, 32);

// Convert to Chrome extension ID format
const extensionId = Array.from(Buffer.from(id, 'hex'))
  .map(b => String.fromCharCode(b + (b < 26 ? 97 : 39)))
  .join('');

console.log(extensionId);
