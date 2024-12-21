import requests
import json
import time
from typing import Dict, List, Optional
from pathlib import Path
import yaml

class MCPRegistry:
    def __init__(self):
        self.config_dir = Path.home() / ".mcphub"
        self.cache_file = self.config_dir / "registry_cache.yaml"
        self.cache_ttl = 3600  # 1 hour cache TTL
        self.registry_url = "https://raw.githubusercontent.com/hemangjoshi37a/mcphub/main/registry/servers.yaml"
        self.config_dir.mkdir(exist_ok=True)

    def fetch_registry(self, force_refresh: bool = False) -> Dict:
        """Fetch the MCP server registry with caching"""
        if not force_refresh and self.cache_file.exists():
            with open(self.cache_file, 'r') as f:
                cache = yaml.safe_load(f)
                if cache.get('timestamp', 0) + self.cache_ttl > time.time():
                    return cache.get('data', {})

        try:
            response = requests.get(self.registry_url)
            response.raise_for_status()
            data = yaml.safe_load(response.text)

            # Save to cache
            cache = {
                'timestamp': time.time(),
                'data': data
            }
            with open(self.cache_file, 'w') as f:
                yaml.dump(cache, f)

            return data

        except Exception as e:
            print(f"Error fetching registry: {e}")
            # Return cached data if available, even if expired
            if self.cache_file.exists():
                with open(self.cache_file, 'r') as f:
                    return yaml.safe_load(f).get('data', {})
            return {'servers': []}

    def submit_server(self, server_data: Dict) -> bool:
        """Submit a new server to the registry via pull request"""
        try:
            # Validate server data
            required_fields = ['name', 'description', 'repository', 'version', 'tags']
            for field in required_fields:
                if field not in server_data:
                    raise ValueError(f"Missing required field: {field}")

            # Create fork if needed
            # Note: This would require GitHub API integration
            # For now, users would need to manually fork and submit PRs
            return True

        except Exception as e:
            print(f"Error submitting server: {e}")
            return False

    def search_servers(self, query: str) -> List[Dict]:
        """Search for servers in the registry"""
        registry = self.fetch_registry()
        query = query.lower()

        results = []
        for server in registry.get('servers', []):
            # Search in name, description, and tags
            if query in server['name'].lower() or \
               query in server['description'].lower() or \
               any(query in tag.lower() for tag in server['tags']):
                results.append(server)

        return results

    def get_server_metadata(self, server_name: str) -> Optional[Dict]:
        """Get metadata for a specific server"""
        registry = self.fetch_registry()
        for server in registry.get('servers', []):
            if server['name'].lower() == server_name.lower():
                return server
        return None

    def verify_server(self, server_data: Dict) -> bool:
        """Verify server compatibility and requirements"""
        try:
            # Check repository existence
            repo_url = server_data.get('repository', '')
            response = requests.head(repo_url)
            if response.status_code != 200:
                return False

            # Could add more verification steps:
            # - Check for required files (requirements.txt, setup.py)
            # - Validate version format
            # - Check for documentation
            # - Verify MCP compatibility

            return True

        except Exception:
            return False