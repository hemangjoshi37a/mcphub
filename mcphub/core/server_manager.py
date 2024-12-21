import os
import json
import yaml
import git
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
import subprocess
import platform
import sys
import time

@dataclass
class ServerConfig:
    name: str
    version: str
    port: int
    auth_token: str
    enabled: bool = True
    install_path: Optional[str] = None
    runtime: str = "node"  # 'node' or 'python'
    command_args: List[str] = None
    env: Dict[str, str] = None

class ServerManager:
    def __init__(self):
        self.config_dir = Path.home() / ".mcphub"
        self.servers_dir = self.config_dir / "servers"
        self.config_file = self.config_dir / "config.yaml"
        self.claude_config_file = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
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
                return yaml.safe_load(f) or {"installed_servers": {}}
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

            # Clone repository if it has one
            if server_data.get("repository"):
                git.Repo.clone_from(server_data["repository"], server_dir)

            # Install server based on runtime
            if server_data.get("runtime") == "python":
                if os.path.exists(server_dir / "requirements.txt"):
                    subprocess.run(
                        [sys.executable, "-m", "pip", "install", "-r", str(server_dir / "requirements.txt")],
                        check=True
                    )
            elif server_data.get("runtime") == "node":
                if "install_command" in server_data and server_data["install_command"] == "npm":
                    install_args = ["npm"] + server_data.get("install_args", [])
                    subprocess.run(install_args, check=True)

            # Save server configuration
            config = self.load_config()
            server_name = server_data["name"].lower().replace(" ", "_")
            config["installed_servers"][server_name] = {
                "version": server_data["version"],
                "install_path": str(server_dir),
                "enabled": True,
                "runtime": server_data.get("runtime", "node"),
                "port": server_data.get("default_config", {}).get("port", 8000),
                "auth_token": server_data.get("default_config", {}).get("auth_token", ""),
                "command_args": server_data.get("command_args", []),
                "env": server_data.get("default_config", {}).get("env", {})
            }
            self.save_config(config)

            # Update Claude desktop config
            self.update_claude_config(server_name, config["installed_servers"][server_name])

            return True

        except Exception as e:
            print(f"Error installing server: {e}")
            return False

    def update_claude_config(self, server_name: str, server_config: Dict):
        """Update the Claude desktop configuration file"""
        try:
            if self.claude_config_file.exists():
                with open(self.claude_config_file, 'r') as f:
                    claude_config = json.load(f)
            else:
                claude_config = {}

            if "mcpServers" not in claude_config:
                claude_config["mcpServers"] = {}

            # Prepare server config
            cmd = "python" if server_config["runtime"] == "python" else "node"
            claude_config["mcpServers"][server_name] = {
                "command": cmd,
                "args": server_config["command_args"],
                "env": server_config.get("env", {})
            }

            # Save updated config
            with open(self.claude_config_file, 'w') as f:
                json.dump(claude_config, f, indent=2)

        except Exception as e:
            print(f"Error updating Claude config: {e}")

    def uninstall_server(self, server_name: str) -> bool:
        """Uninstall an MCP server"""
        try:
            config = self.load_config()
            if server_name in config["installed_servers"]:
                server_dir = Path(config["installed_servers"][server_name]["install_path"])
                if server_dir.exists():
                    shutil.rmtree(server_dir)

                # Remove from Claude config
                if self.claude_config_file.exists():
                    with open(self.claude_config_file, 'r') as f:
                        claude_config = json.load(f)
                    
                    if "mcpServers" in claude_config and server_name in claude_config["mcpServers"]:
                        del claude_config["mcpServers"][server_name]
                        
                        with open(self.claude_config_file, 'w') as f:
                            json.dump(claude_config, f, indent=2)

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
                install_path=data["install_path"],
                runtime=data.get("runtime", "node"),
                command_args=data.get("command_args", []),
                env=data.get("env", {})
            ))
        return servers

    def update_server_config(self, server_name: str, new_config: Dict) -> bool:
        """Update server configuration"""
        try:
            config = self.load_config()
            if server_name in config["installed_servers"]:
                config["installed_servers"][server_name].update(new_config)
                self.save_config(config)

                # Update Claude config
                self.update_claude_config(server_name, config["installed_servers"][server_name])
                return True
            return False

        except Exception as e:
            print(f"Error updating server config: {e}")
            return False