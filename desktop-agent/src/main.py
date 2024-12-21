from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import subprocess
import sys
from typing import Dict, List
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
    runtime: str
    package: str
    command_args: List[str]
    env: Dict[str, str] = {}

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
        config_path = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
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
        config_path = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
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
            subprocess.run(["npm", "install", "-g", server.package], check=True)
        else:
            subprocess.run([sys.executable, "-m", "pip", "install", server.package], check=True)
        
        # Update Claude config
        config = await get_config()
        config["mcpServers"] = config.get("mcpServers", {})
        config["mcpServers"][server.name] = {
            "command": "node" if server.runtime == "node" else "python",
            "args": server.command_args,
            "env": server.env
        }
        
        await update_config(ConfigUpdate(config=config))
        return {"status": "success"}
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
    uvicorn.run(app, host="localhost", port=3000)