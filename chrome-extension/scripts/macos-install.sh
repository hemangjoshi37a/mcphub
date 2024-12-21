#!/bin/bash

# Get directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Generate extension ID based on public key
EXTENSION_ID=$(node scripts/generate-extension-id.js)

# Update manifest.json with extension ID
node scripts/update-manifest.js $EXTENSION_ID

# Update native host manifest
node scripts/update-host-manifest.js $EXTENSION_ID

# Create native messaging host directory
HOST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
mkdir -p "$HOST_DIR"

# Install native host manifest
cp native-host/manifest.json "$HOST_DIR/com.mcphub.agent.json"

# Install native host dependencies
cd native-host
npm install

echo "Installation complete!"
echo "Extension ID: $EXTENSION_ID"
echo "Please load the extension in Chrome from the chrome-extension directory"
