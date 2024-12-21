# MCPHub 🚀

[![Web](https://img.shields.io/badge/Web-Next.js-black.svg)](https://nextjs.org/)
[![Agent](https://img.shields.io/badge/Agent-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.0.3-brightgreen.svg)](https://modelcontextprotocol.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

MCPHub is a web-based manager for Model Context Protocol (MCP) servers. It provides a modern interface to discover, install, and manage MCP servers while maintaining compatibility with Claude Desktop.

## ⭐ Features

- 📦 Browse and search available MCP servers
- 🔄 One-click installation and updates
- ⚙️ Configure server settings through intuitive UI
- 🔒 Secure local system operations
- 📊 Monitor server status and health
- 🔍 Version tracking and compatibility checks
- 💾 Local configuration management
- 🌐 Cross-platform support

## 🏗️ Architecture

MCPHub uses a hybrid architecture:
- Web Frontend: Next.js-based web application
- Desktop Agent: FastAPI-based local service
- Configuration: Integration with Claude Desktop config

## 🚀 Quick Start

### Desktop Agent

1. Install dependencies:
```bash
cd desktop-agent
pip install -r requirements.txt
```

2. Run the agent:
```bash
python src/main.py
```

### Web Frontend (Development)

1. Install dependencies:
```bash
cd web
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## 🔧 Server Configuration

MCPHub manages MCP servers through the Claude Desktop configuration file located at:
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## 📝 Server Registry

Available MCP servers are listed in `registry/servers.yaml`. To add a new server:
1. Fork the repository
2. Add your server details to `registry/servers.yaml`
3. Create a pull request

Example server entry:
```yaml
- name: "GitHub MCP Server"
  description: "GitHub operations server for LLMs"
  runtime: "node"
  package: "@modelcontextprotocol/server-github"
  version: "1.0.0"
  command_args:
    - "@modelcontextprotocol/server-github"
  env:
    GITHUB_PERSONAL_ACCESS_TOKEN: ""
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://mcphub.io/docs)
- [Issue Tracker](https://github.com/hemangjoshi37a/mcphub/issues)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

<div align="center">
Made with ❤️ by the MCPHub community
</div>