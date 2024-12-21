# MCPHub 🚀

[![Web](https://img.shields.io/badge/Web-Next.js-black.svg)](https://nextjs.org/)
[![Agent](https://img.shields.io/badge/Agent-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.0.3-brightgreen.svg)](https://modelcontextprotocol.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

MCPHub is a hybrid web/desktop application for managing Model Context Protocol (MCP) servers. Think of it as apt/pip but for MCP servers, with a modern web interface and secure local system integration.

## 🌟 Features

- 📦 Browse and install MCP servers
- ⚙️ Manage server configurations
- 🔐 Secure local operations through desktop agent
- 🌐 Web-based interface
- 🔄 Real-time status monitoring
- 🛠️ Environment variable management
- 📝 Claude Desktop config integration
- 🖥️ Cross-platform support

## 🏗️ Architecture

MCPHub uses a hybrid architecture consisting of three main components:

### 1. Desktop Agent
- FastAPI-based local service
- Handles file system operations
- Manages Claude Desktop config
- Executes installation commands
- Runs on localhost:3000

### 2. Web Frontend
- Next.js application
- Material-UI components
- TypeScript support
- Real-time server status
- Dynamic configuration UI

### 3. Server Registry
- YAML-based server catalog
- Standardized configurations
- Easy contribution process
- Version tracking

## 🚀 Quick Start

### Desktop Agent Setup
1. Navigate to the agent directory:
```bash
cd desktop-agent
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the agent:
```bash
python src/main.py
```

### Web Frontend Setup
1. Navigate to the web directory:
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

4. Open http://localhost:3000 in your browser

## 📁 Project Structure
```
mcphub/
├── desktop-agent/           # Local system operations
│   ├── src/
│   │   └── main.py         # FastAPI application
│   └── requirements.txt     # Python dependencies
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── pages/         # React components
│   │   └── styles/        # CSS styles
│   └── package.json       # Node.js dependencies
└── registry/              # Server registry
    └── servers.yaml       # Available servers
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

## 🔄 Local Development

### Desktop Agent API Endpoints
- GET `/health` - Health check
- GET `/config` - Get Claude config
- POST `/config` - Update Claude config
- POST `/install` - Install MCP server
- DELETE `/uninstall/{server_name}` - Uninstall server

### Web Frontend Development
- Uses Next.js 13
- Material-UI for components
- Axios for API calls
- TypeScript for type safety

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
