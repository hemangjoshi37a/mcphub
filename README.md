# MCPHub 🚀

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Model Context Protocol](https://img.shields.io/badge/MCP-1.0.3-brightgreen.svg)](https://modelcontextprotocol.io/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

MCPHub is a cross-platform GUI application that makes discovering, installing, and managing Model Context Protocol (MCP) servers as easy as managing packages with pip or libraries in Arduino IDE.

![MCPHub Screenshot](docs/images/screenshot.png)

## 🌟 Features

- 📦 Browse and search available MCP servers
- 🔄 One-click installation and updates
- ⚙️ Configure server settings through intuitive UI
- 🔒 Manage authentication and security settings
- 📊 Monitor server status and health
- 🔍 Version tracking and compatibility checks
- 💾 Local configuration storage
- 🌐 Cross-platform support (Windows, macOS, Linux)

## 🚀 Quick Start

1. Install MCPHub:
```bash
pip install mcphub
```

2. Launch the application:
```bash
mcphub
```

## 💻 Development Setup

1. Clone the repository:
```bash
git clone https://github.com/hemangjoshi37a/mcphub.git
cd mcphub
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

4. Run the application in development mode:
```bash
python -m mcphub
```

## 🏗️ Project Structure

```
mcphub/
├── mcphub/
│   ├── __init__.py
│   ├── app.py           # Main application entry
│   ├── ui/             # UI components
│   ├── core/           # Core functionality
│   ├── models/         # Data models
│   └── utils/          # Utility functions
├── tests/              # Test suite
├── docs/               # Documentation
└── scripts/            # Development scripts
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://mcphub.readthedocs.io/)
- [Issue Tracker](https://github.com/hemangjoshi37a/mcphub/issues)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

<div align="center">
Made with ❤️ by the MCP community
</div>
