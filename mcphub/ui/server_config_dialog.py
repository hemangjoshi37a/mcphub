import customtkinter as ctk
from typing import Dict, Callable

class ServerConfigDialog(ctk.CTkToplevel):
    def __init__(self, parent, server_name: str, current_config: Dict, on_save: Callable):
        super().__init__(parent)

        self.title(f"Configure {server_name}")
        self.geometry("400x300")

        # Make dialog modal
        self.transient(parent)
        self.grab_set()

        # Store callback
        self.on_save = on_save

        # Create form
        self.create_widgets(current_config)

    def create_widgets(self, config: Dict):
        # Port configuration
        port_label = ctk.CTkLabel(self, text="Port:")
        port_label.grid(row=0, column=0, padx=10, pady=5, sticky="w")

        self.port_entry = ctk.CTkEntry(self)
        self.port_entry.grid(row=0, column=1, padx=10, pady=5, sticky="ew")
        self.port_entry.insert(0, str(config.get("port", 8000)))

        # Auth token configuration
        token_label = ctk.CTkLabel(self, text="Auth Token:")
        token_label.grid(row=1, column=0, padx=10, pady=5, sticky="w")

        self.token_entry = ctk.CTkEntry(self, show="*")
        self.token_entry.grid(row=1, column=1, padx=10, pady=5, sticky="ew")
        self.token_entry.insert(0, config.get("auth_token", ""))

        # Enable/Disable switch
        self.enabled_var = ctk.BooleanVar(value=config.get("enabled", True))
        enabled_switch = ctk.CTkSwitch(
            self, text="Enabled", variable=self.enabled_var
        )
        enabled_switch.grid(row=2, column=0, columnspan=2, padx=10, pady=10)

        # Save button
        save_button = ctk.CTkButton(
            self, text="Save", command=self.save_config
        )
        save_button.grid(row=3, column=0, columnspan=2, padx=10, pady=20)

        # Configure grid
        self.grid_columnconfigure(1, weight=1)

    def save_config(self):
        config = {
            "port": int(self.port_entry.get()),
            "auth_token": self.token_entry.get(),
            "enabled": self.enabled_var.get()
        }
        self.on_save(config)
        self.destroy()