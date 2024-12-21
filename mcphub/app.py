import customtkinter as ctk
import json
import os
import yaml
from pathlib import Path
from typing import Dict, List
import requests
import threading
from datetime import datetime
from .core.server_manager import ServerManager
from .ui.server_config_dialog import ServerConfigDialog

class MCPHub(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Initialize server manager
        self.server_manager = ServerManager()

        # Configure window
        self.title("MCPHub - MCP Server Manager")
        self.geometry("1000x600")
        
        # Configure grid layout
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        self.create_sidebar()
        self.create_main_frame()

        # Initialize server registry
        self.server_registry = self.load_server_registry()
        
        # Show browse page by default
        self.show_browse_page()

    def create_sidebar(self):
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

    def create_main_frame(self):
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)

    def load_server_registry(self) -> Dict:
        """Load the MCP server registry from a remote source"""
        # TODO: Implement actual registry loading from a central repository
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
                },
                {
                    "name": "Git MCP Server",
                    "description": "Git operations server for LLMs",
                    "repository": "https://github.com/cyanheads/git-mcp-server",
                    "version": "0.9.0",
                    "tags": ["git", "version-control"],
                    "config_schema": {
                        "port": {"type": "integer", "default": 8001},
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

        # Version and tags
        info_text = f"Version: {server_data['version']} | Tags: {', '.join(server_data['tags'])}"
        info_label = ctk.CTkLabel(card, text=info_text, text_color="gray")
        info_label.grid(row=2, column=0, padx=10, pady=(0, 10), sticky="w")

        # Add install button
        install_button = ctk.CTkButton(
            card, text="Install", width=100,
            command=lambda: self.install_server(server_data)
        )
        install_button.grid(row=0, column=1, padx=10, pady=10, sticky="e")

    def install_server(self, server_data):
        def install_thread():
            success = self.server_manager.install_server(server_data)
            if success:
                self.after(0, lambda: self.show_message("Success", f"Successfully installed {server_data['name']}"))
            else:
                self.after(0, lambda: self.show_message("Error", f"Failed to install {server_data['name']}"))

        # Show progress dialog
        progress = self.show_progress(f"Installing {server_data['name']}...")
        
        # Start installation in thread
        thread = threading.Thread(target=install_thread)
        thread.start()

    def show_installed_page(self):
        # Clear main frame
        for widget in self.main_frame.winfo_children():
            widget.destroy()

        # Get installed servers
        installed_servers = self.server_manager.get_installed_servers()

        # Create scrollable frame for servers
        servers_frame = ctk.CTkScrollableFrame(self.main_frame)
        servers_frame.pack(fill="both", expand=True, padx=10, pady=10)

        # Add server cards
        for server in installed_servers:
            self.create_installed_server_card(servers_frame, server)

    def create_installed_server_card(self, parent, server):
        card = ctk.CTkFrame(parent)
        card.pack(fill="x", padx=5, pady=5)

        # Server name and status
        name_label = ctk.CTkLabel(
            card, text=server.name, font=ctk.CTkFont(size=16, weight="bold")
        )
        name_label.grid(row=0, column=0, padx=10, pady=(10, 5), sticky="w")

        status_text = "Enabled" if server.enabled else "Disabled"
        status_label = ctk.CTkLabel(card, text=status_text, text_color="gray")
        status_label.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="w")

        # Control buttons
        button_frame = ctk.CTkFrame(card)
        button_frame.grid(row=0, column=1, rowspan=2, padx=10, pady=10, sticky="e")

        start_button = ctk.CTkButton(
            button_frame, text="Start", width=80,
            command=lambda: self.server_manager.start_server(server.name)
        )
        start_button.pack(side="left", padx=5)

        stop_button = ctk.CTkButton(
            button_frame, text="Stop", width=80,
            command=lambda: self.server_manager.stop_server(server.name)
        )
        stop_button.pack(side="left", padx=5)

        config_button = ctk.CTkButton(
            button_frame, text="Configure", width=80,
            command=lambda: self.show_config_dialog(server)
        )
        config_button.pack(side="left", padx=5)

        uninstall_button = ctk.CTkButton(
            button_frame, text="Uninstall", width=80,
            command=lambda: self.uninstall_server(server.name)
        )
        uninstall_button.pack(side="left", padx=5)

    def show_config_dialog(self, server):
        config = {
            "port": server.port,
            "auth_token": server.auth_token,
            "enabled": server.enabled
        }
        dialog = ServerConfigDialog(
            self, server.name, config,
            lambda new_config: self.server_manager.update_server_config(server.name, new_config)
        )

    def uninstall_server(self, server_name):
        if self.server_manager.uninstall_server(server_name):
            self.show_message("Success", f"Successfully uninstalled {server_name}")
            self.show_installed_page()  # Refresh the page
        else:
            self.show_message("Error", f"Failed to uninstall {server_name}")

    def show_settings_page(self):
        # Clear main frame
        for widget in self.main_frame.winfo_children():
            widget.destroy()

        # Create settings form
        settings_frame = ctk.CTkFrame(self.main_frame)
        settings_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Registry URL setting
        url_label = ctk.CTkLabel(
            settings_frame, text="Registry URL:",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        url_label.grid(row=0, column=0, padx=10, pady=(20, 5), sticky="w")

        url_entry = ctk.CTkEntry(settings_frame, width=300)
        url_entry.grid(row=1, column=0, padx=10, pady=(0, 20), sticky="w")
        url_entry.insert(0, "https://registry.mcphub.io")

        # Auto-update setting
        auto_update_var = ctk.BooleanVar(value=True)
        auto_update = ctk.CTkSwitch(
            settings_frame, text="Auto-update servers",
            variable=auto_update_var
        )
        auto_update.grid(row=2, column=0, padx=10, pady=10, sticky="w")

    def show_message(self, title: str, message: str):
        dialog = ctk.CTkToplevel(self)
        dialog.title(title)
        dialog.geometry("300x150")
        dialog.transient(self)
        dialog.grab_set()

        label = ctk.CTkLabel(dialog, text=message)
        label.pack(expand=True)

        button = ctk.CTkButton(dialog, text="OK", command=dialog.destroy)
        button.pack(pady=20)

    def show_progress(self, message: str) -> ctk.CTkToplevel:
        dialog = ctk.CTkToplevel(self)
        dialog.title("Progress")
        dialog.geometry("300x150")
        dialog.transient(self)
        dialog.grab_set()

        label = ctk.CTkLabel(dialog, text=message)
        label.pack(expand=True)

        return dialog

def main():
    app = MCPHub()
    app.mainloop()

if __name__ == "__main__":
    main()