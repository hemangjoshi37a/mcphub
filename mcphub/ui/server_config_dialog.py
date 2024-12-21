import customtkinter as ctk
from typing import Dict, Callable
import json
from pathlib import Path
import os

class EnvVarDialog(ctk.CTkToplevel):
    def __init__(self, parent, on_save):
        super().__init__(parent)
        self.title("Add Environment Variable")
        self.geometry("400x150")

        # Make dialog modal
        self.transient(parent)
        self.grab_set()

        self.on_save = on_save

        # Key input
        key_label = ctk.CTkLabel(self, text="Key:")
        key_label.grid(row=0, column=0, padx=10, pady=5, sticky="w")
        self.key_entry = ctk.CTkEntry(self)
        self.key_entry.grid(row=0, column=1, padx=10, pady=5, sticky="ew")

        # Value input
        value_label = ctk.CTkLabel(self, text="Value:")
        value_label.grid(row=1, column=0, padx=10, pady=5, sticky="w")
        self.value_entry = ctk.CTkEntry(self)
        self.value_entry.grid(row=1, column=1, padx=10, pady=5, sticky="ew")

        # Save button
        save_button = ctk.CTkButton(self, text="Save", command=self.save)
        save_button.grid(row=2, column=0, columnspan=2, padx=10, pady=20)

        self.grid_columnconfigure(1, weight=1)

    def save(self):
        key = self.key_entry.get()
        value = self.value_entry.get()
        if key and value:
            self.on_save(key, value)
            self.destroy()

class ServerConfigDialog(ctk.CTkToplevel):
    def __init__(self, parent, server_name: str, current_config: Dict, on_save: Callable):
        super().__init__(parent)

        self.title(f"Configure {server_name}")
        self.geometry("600x400")

        # Make dialog modal
        self.transient(parent)
        self.grab_set()

        # Store callback and initial config
        self.on_save = on_save
        self.current_config = current_config
        self.env_vars = self.current_config.get("env", {})

        # Create scrollable frame for all content
        self.main_frame = ctk.CTkScrollableFrame(self)
        self.main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        self.create_widgets()

    def create_widgets(self):
        # Basic settings section
        settings_label = ctk.CTkLabel(
            self.main_frame, 
            text="Basic Settings",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        settings_label.pack(anchor="w", padx=10, pady=(0, 10))

        # Port configuration
        port_frame = ctk.CTkFrame(self.main_frame)
        port_frame.pack(fill="x", padx=10, pady=5)

        port_label = ctk.CTkLabel(port_frame, text="Port:")
        port_label.pack(side="left", padx=5)

        self.port_entry = ctk.CTkEntry(port_frame)
        self.port_entry.pack(side="right", expand=True, fill="x", padx=5)
        self.port_entry.insert(0, str(self.current_config.get("port", 8000)))

        # Auth token configuration
        token_frame = ctk.CTkFrame(self.main_frame)
        token_frame.pack(fill="x", padx=10, pady=5)

        token_label = ctk.CTkLabel(token_frame, text="Auth Token:")
        token_label.pack(side="left", padx=5)

        self.token_entry = ctk.CTkEntry(token_frame, show="*")
        self.token_entry.pack(side="right", expand=True, fill="x", padx=5)
        self.token_entry.insert(0, self.current_config.get("auth_token", ""))

        # Environment Variables section
        env_label = ctk.CTkLabel(
            self.main_frame,
            text="Environment Variables",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        env_label.pack(anchor="w", padx=10, pady=(20, 10))

        # Add env var button
        add_env_button = ctk.CTkButton(
            self.main_frame,
            text="Add Environment Variable",
            command=self.add_env_var
        )
        add_env_button.pack(anchor="w", padx=10, pady=5)

        # Environment variables list
        self.env_frame = ctk.CTkFrame(self.main_frame)
        self.env_frame.pack(fill="x", padx=10, pady=5)
        self.refresh_env_vars()

        # Save button
        save_button = ctk.CTkButton(
            self.main_frame,
            text="Save",
            command=self.save_config
        )
        save_button.pack(pady=20)

    def refresh_env_vars(self):
        # Clear existing widgets
        for widget in self.env_frame.winfo_children():
            widget.destroy()

        # Add header
        if self.env_vars:
            header_frame = ctk.CTkFrame(self.env_frame)
            header_frame.pack(fill="x", pady=(0, 5))
            
            ctk.CTkLabel(header_frame, text="Key").pack(side="left", expand=True)
            ctk.CTkLabel(header_frame, text="Value").pack(side="left", expand=True)
            ctk.CTkLabel(header_frame, text="Actions").pack(side="left", padx=10)

        # Add env vars
        for key, value in self.env_vars.items():
            var_frame = ctk.CTkFrame(self.env_frame)
            var_frame.pack(fill="x", pady=2)

            ctk.CTkLabel(var_frame, text=key).pack(side="left", expand=True)
            ctk.CTkLabel(var_frame, text="****" if "TOKEN" in key.upper() else value).pack(side="left", expand=True)
            
            delete_btn = ctk.CTkButton(
                var_frame,
                text="Delete",
                width=60,
                command=lambda k=key: self.delete_env_var(k)
            )
            delete_btn.pack(side="right", padx=5)

    def add_env_var(self):
        def on_save(key, value):
            self.env_vars[key] = value
            self.refresh_env_vars()

        EnvVarDialog(self, on_save)

    def delete_env_var(self, key):
        if key in self.env_vars:
            del self.env_vars[key]
            self.refresh_env_vars()

    def save_config(self):
        config = {
            "port": int(self.port_entry.get()),
            "auth_token": self.token_entry.get(),
            "env": self.env_vars
        }

        # Update Claude desktop config
        self.update_claude_config(config)
        
        # Call the original save callback
        self.on_save(config)
        self.destroy()

    def update_claude_config(self, config):
        config_path = Path(os.path.expandvars("%APPDATA%")) / "Claude" / "claude_desktop_config.json"
        
        if config_path.exists():
            try:
                with open(config_path, 'r') as f:
                    claude_config = json.load(f)

                # Update MCP server config
                if "mcpServers" not in claude_config:
                    claude_config["mcpServers"] = {}

                server_name = self.title().replace("Configure ", "").lower()
                claude_config["mcpServers"][server_name] = {
                    "command": config.get("command", "node"),
                    "args": config.get("command_args", []),
                    "env": config.get("env", {})
                }

                with open(config_path, 'w') as f:
                    json.dump(claude_config, f, indent=2)

            except Exception as e:
                print(f"Error updating Claude config: {e}")
