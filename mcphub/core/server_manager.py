import os
import json
import yaml
import git
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
import subprocess
import platform

@dataclass
class ServerConfig:
    name: str
    version: str
    port: int
    auth_token: str
    enabled: bool = True
    install_path: Optional[str] = None

class ServerManager:
    def __init__(self):
        self.config_dir = Path.home() / ".mcphub"
        self.servers_dir = self.config_dir / "servers"
        self.config_file = self.config_dir / "config.yaml"
        self.setup_directories()
        self.load_config()

    def setup_directories(self):
        """Create necessary directories if they don't exist"""
        self.config_dir.mkdir(exist_ok=True)
        self.servers_dir.mkdir(exist_ok=True)

    def load_config(self) -> Dict:
        """Load configuration from config file"""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                return yaml.safe_load(f)
        return {"installed_servers": {}}

    def save_config(self, config: Dict):
        """Save configuration to config file"""
        with open(self.config_file, 'w') as f:
            yaml.safe_dump(config, f)

    def install_server(self, server_data: Dict) -> bool:
        """Install an MCP server from its repository"""
        try:
            # Create server directory
            server_dir = self.servers_dir / server_data["name"].lower().replace(" ", "_")
            server_dir.mkdir(exist_ok=True)

            # Clone repository
            git.Repo.clone_from(server_data["repository"], server_dir)

            # Install dependencies if requirements.txt exists
            req_file = server_dir / "requirements.txt"
            if req_file.exists():
                subprocess.run(
                    [sys.executable, "-m", "pip", "install", "-r", str(req_file)],
                    check=True
                )

            # Save server configuration
            config = self.load_config()
            config["installed_servers"][server_data["name"]] = {
                "version": server_data["version"],
                "install_path": str(server_dir),
                "enabled": True,
                "port": server_data.get("config_schema", {}).get("port", {}).get("default", 8000),
                "auth_token": ""
            }
            self.save_config(config)
            return True

        except Exception as e:
            print(f"Error installing server: {e}")
            return False

    def uninstall_server(self, server_name: str) -> bool:
        """Uninstall an MCP server"""
        try:
            config = self.load_config()
            if server_name in config["installed_servers"]:
                server_dir = Path(config["installed_servers"][server_name]["install_path"])
                if server_dir.exists():
                    import shutil
                    shutil.rmtree(server_dir)
                del config["installed_servers"][server_name]
                self.save_config(config)
                return True
            return False

        except Exception as e:
            print(f"Error uninstalling server: {e}")
            return False

    def get_installed_servers(self) -> List[ServerConfig]:
        """Get list of installed servers"""
        config = self.load_config()
        servers = []
        for name, data in config["installed_servers"].items():
            servers.append(ServerConfig(
                name=name,
                version=data["version"],
                port=data["port"],
                auth_token=data["auth_token"],
                enabled=data["enabled"],
                install_path=data["install_path"]
            ))
        return servers

    def update_server_config(self, server_name: str, new_config: Dict) -> bool:
        """Update server configuration"""
        try:
            config = self.load_config()
            if server_name in config["installed_servers"]:
                config["installed_servers"][server_name].update(new_config)
                self.save_config(config)
                return True
            return False

        except Exception as e:
            print(f"Error updating server config: {e}")
            return False

    def start_server(self, server_name: str) -> bool:
        """Start an installed MCP server"""
        config = self.load_config()
        if server_name not in config["installed_servers"]:
            return False

        server_config = config["installed_servers"][server_name]
        server_dir = Path(server_config["install_path"])

        try:
            # Find the main server file (could be improved based on actual server structure)
            main_file = next(server_dir.glob("**/server.py"), None)
            if not main_file:
                main_file = next(server_dir.glob("**/main.py"), None)

            if main_file:
                # Start server process
                cmd = [
                    sys.executable,
                    str(main_file),
                    "--port", str(server_config["port"])
                ]
                if server_config["auth_token"]:
                    cmd.extend(["--auth-token", server_config["auth_token"]])

                # Use different methods based on platform
                if platform.system() == "Windows":
                    from subprocess import CREATE_NO_WINDOW
                    subprocess.Popen(cmd, cwd=server_dir, creationflags=CREATE_NO_WINDOW)
                else:
                    subprocess.Popen(cmd, cwd=server_dir)
                return True

        except Exception as e:
            print(f"Error starting server: {e}")
        return False

    def stop_server(self, server_name: str) -> bool:
        """Stop a running MCP server"""
        # This is a basic implementation. In practice, you'd want to:
        # 1. Keep track of server processes
        # 2. Send proper shutdown signals
        # 3. Handle cleanup
        try:
            # Find and kill server process (platform-specific)
            if platform.system() == "Windows":
                subprocess.run(["taskkill", "/F", "/IM", "python.exe"])
            else:
                subprocess.run(["pkill", "-f", server_name])
            return True
        except Exception as e:
            print(f"Error stopping server: {e}")
            return False