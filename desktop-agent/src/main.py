from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import subprocess
import sys
from typing import Dict, List, Optional
from pathlib import Path
from dataclasses import dataclass
from pydantic import BaseModel

app = FastAPI()

# Allow CORS for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mcphub.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ServerConfig(BaseModel):
    name: str
    description: str
    repository: str
    version: str
    tags: List[str]
    runtime: str
    install_command: str
    install_args: Optional[List[str]] = None
    command_args: List[str]
    default_config: Dict

class ConfigUpdate(BaseModel):
    config: Dict

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/config")
async def get_config():
    """Get Claude desktop config"""
    try:
        if sys.platform == "win32":
            config_path = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
        elif sys.platform == "darwin":
            config_path = Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json"
        else:  # Linux and others
            config_path = Path.home() / ".config" / "Claude" / "claude_desktop_config.json"

        if config_path.exists():
            with open(config_path, 'r') as f:
                return json.load(f)
        return {"mcpServers": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/config")
async def update_config(config_update: ConfigUpdate):
    """Update Claude desktop config"""
    try:
        if sys.platform == "win32":
            config_path = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
        elif sys.platform == "darwin":
            config_path = Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json"
        else:  # Linux and others
            config_path = Path.home() / ".config" / "Claude" / "claude_desktop_config.json"

        # Create directory if it doesn't exist
        config_path.parent.mkdir(parents=True, exist_ok=True)

        with open(config_path, 'w') as f:
            json.dump(config_update.config, f, indent=2)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/install")
async def install_server(server: ServerConfig):
    """Install MCP server"""
    try:
        if server.runtime == "node":
            if server.install_args:
                subprocess.run([server.install_command, *server.install_args], check=True)
            else:
                subprocess.run(["npm", "install", "-g", server.package], check=True)
        else:  # python
            if server.install_args:
                subprocess.run([sys.executable, "-m", "pip", "install", *server.install_args], check=True)
            else:
                subprocess.run([sys.executable, "-m", "pip", "install", "-e", "."], cwd=server.repository, check=True)
        
        # Update Claude config
        config = await get_config()
        config["mcpServers"] = config.get("mcpServers", {})
        
        # Extract env from default_config if it exists
        env = server.default_config.get("env", {})
        
        config["mcpServers"][server.name] = {
            "command": server.install_command,
            "args": server.command_args,
            "env": env,
            "port": server.default_config.get("port", 8000),
            "auth_token": server.default_config.get("auth_token", "")
        }
        
        await update_config(ConfigUpdate(config=config))
        return {"status": "success"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Installation failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/uninstall/{server_name}")
async def uninstall_server(server_name: str):
    """Uninstall MCP server"""
    try:
        config = await get_config()
        if "mcpServers" in config and server_name in config["mcpServers"]:
            # Remove from Claude config
            del config["mcpServers"][server_name]
            await update_config(ConfigUpdate(config=config))
            
            return {"status": "success"}
        raise HTTPException(status_code=404, detail="Server not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=3004)