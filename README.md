# MCPHub 🚀

[![Web](https://img.shields.io/badge/Web-Next.js-black.svg)](https://nextjs.org/)
[![Extension](https://img.shields.io/badge/Extension-Chrome-4285F4.svg)](https://developer.chrome.com/docs/extensions/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.0.3-brightgreen.svg)](https://modelcontextprotocol.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

MCPHub is a hybrid web/extension application for managing Model Context Protocol (MCP) servers. Think of it as apt/pip but for MCP servers, with a modern web interface and secure local system integration.

## 🌟 Features

- 📦 Browse and install MCP servers
- ⚙️ Manage server configurations
- 🔐 Secure local operations through Chrome extension
- 🌐 Web-based interface
- 🔄 Real-time status monitoring
- 🛠️ Environment variable management
- 📝 Claude Desktop config integration
- 🖥️ Cross-platform support

## 🚀 Quick Start

### Install Chrome Extension and Native Host

**Windows:**
1. Clone this repository
2. Run installation script:
```batch
cd chrome-extension/scripts
windows-install.bat
```
3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `chrome-extension` directory

**MacOS/Linux:**
1. Clone this repository
2. Run installation script:
```bash
cd chrome-extension/scripts
# For MacOS:
./macos-install.sh
# For Linux:
./linux-install.sh
```
3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `chrome-extension` directory

### Run Web Frontend
1. Navigate to web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in Chrome

## 📁 Project Structure
```
mcphub/
├── chrome-extension/       # Chrome extension
│   ├── manifest.json      # Extension manifest
│   ├── background.js      # Service worker
│   ├── popup/            # Extension popup UI
│   ├── native-host/      # Native messaging host
│   └── scripts/          # Installation scripts
├── web/                  # Next.js frontend
│   ├── src/             # Source code
│   └── package.json     # Dependencies
└── registry/            # Server registry
    └── servers.yaml     # Available servers
```

## ⚙️ Configuration

### Claude Desktop Integration
MCPHub manages the Claude Desktop config file located at:
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### Server Configuration Example
```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": [
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## 🔄 Development

### Chrome Extension
- Uses Manifest V3
- Native messaging for system operations
- Auto-generated extension ID
- Cross-platform installation scripts

### Web Frontend
- Next.js 13 with TypeScript
- Material-UI components
- Chrome extension integration
- Real-time status monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes:
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch:
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

### Adding New MCP Servers
Add your server to `registry/servers.yaml`:
```yaml
- name: "Your MCP Server"
  description: "Server description"
  runtime: "node"  # or "python"
  package: "your-package-name"
  version: "1.0.0"
  command_args:
    - "your-command-args"
  env:
    YOUR_ENV_VAR: ""
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://mcphub.io/docs)
- [Issue Tracker](https://github.com/hemangjoshi37a/mcphub/issues)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

<div align="center">
Made with ❤️ by the MCPHub community
</div>
