import customtkinter as ctk
import json
import os
import yaml
from pathlib import Path
from typing import Dict, List
import requests
import threading
from datetime import datetime

class MCPHub(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Configure window
        self.title("MCPHub - MCP Server Manager")
        self.geometry("1000x600")
        
        # Configure grid layout
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # Create sidebar frame
        self.sidebar_frame = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(4, weight=1)

        # Create logo label
        self.logo_label = ctk.CTkLabel(
            self.sidebar_frame, text="MCPHub", font=ctk.CTkFont(size=20, weight="bold")
        )
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        # Create sidebar buttons
        self.browse_button = ctk.CTkButton(
            self.sidebar_frame, text="Browse Servers", command=self.show_browse_page
        )
        self.browse_button.grid(row=1, column=0, padx=20, pady=10)

        self.installed_button = ctk.CTkButton(
            self.sidebar_frame, text="Installed Servers", command=self.show_installed_page
        )
        self.installed_button.grid(row=2, column=0, padx=20, pady=10)

        self.settings_button = ctk.CTkButton(
            self.sidebar_frame, text="Settings", command=self.show_settings_page
        )
        self.settings_button.grid(row=3, column=0, padx=20, pady=10)

        # Create main content frame
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)

        # Initialize server registry
        self.server_registry = self.load_server_registry()
        
        # Show browse page by default
        self.show_browse_page()

    def load_server_registry(self) -> Dict:
        """Load the MCP server registry from a remote source"""
        # TODO: Implement actual registry loading
        # This is a placeholder that returns sample data
        return {
            "servers": [
                {
                    "name": "Atlas MCP Server",
                    "description": "Task management and organization server for LLMs",
                    "repository": "https://github.com/cyanheads/atlas-mcp-server",
                    "version": "1.0.0",
                    "tags": ["task-management", "organization"],
                    "config_schema": {
                        "port": {"type": "integer", "default": 8000},
                        "auth_token": {"type": "string", "required": True}
                    }
                }
            ]
        }

    def show_browse_page(self):
        # Clear main frame
        for widget in self.main_frame.winfo_children():
            widget.destroy()

        # Add search bar
        search_frame = ctk.CTkFrame(self.main_frame)
        search_frame.pack(fill="x", padx=10, pady=10)

        search_entry = ctk.CTkEntry(search_frame, placeholder_text="Search servers...")
        search_entry.pack(side="left", fill="x", expand=True, padx=(0, 10))

        search_button = ctk.CTkButton(search_frame, text="Search")
        search_button.pack(side="right")

        # Add server list
        servers_frame = ctk.CTkScrollableFrame(self.main_frame)
        servers_frame.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        # Add server cards
        for server in self.server_registry["servers"]:
            self.create_server_card(servers_frame, server)

    def create_server_card(self, parent, server_data):
        # Create card frame
        card = ctk.CTkFrame(parent)
        card.pack(fill="x", padx=5, pady=5)

        # Add server info
        name_label = ctk.CTkLabel(
            card, text=server_data["name"], font=ctk.CTkFont(size=16, weight="bold")
        )
        name_label.grid(row=0, column=0, padx=10, pady=(10, 5), sticky="w")

        desc_label = ctk.CTkLabel(card, text=server_data["description"])
        desc_label.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="w")

        # Add install button
        install_button = ctk.CTkButton(
            card, text="Install", width=100,
            command=lambda: self.install_server(server_data)
        )
        install_button.grid(row=0, column=1, padx=10, pady=10, sticky="e")

    def install_server(self, server_data):
        # TODO: Implement server installation logic
        print(f"Installing {server_data['name']}...")

    def show_installed_page(self):
        # TODO: Implement installed servers page
        pass

    def show_settings_page(self):
        # TODO: Implement settings page
        pass

def main():
    app = MCPHub()
    app.mainloop()

if __name__ == "__main__":
    main()