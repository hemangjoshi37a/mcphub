import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack
} from '@mui/material';
import axios from 'axios';
import yaml from 'js-yaml';

interface MCPServer {
  name: string;
  description: string;
  repository: string;
  version: string;
  tags: string[];
  runtime: string;
  install_command: string;
  install_args?: string[];
  command_args: string[];
  default_config: {
    port: number;
    auth_token: string;
    env?: Record<string, string>;
    [key: string]: any;
  };
}

interface Config {
  mcpServers: Record<string, any>;
}

interface RegistryData {
  servers: MCPServer[];
}

export default function Home() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [installInProgress, setInstallInProgress] = useState<string | null>(null);
  const [serverConfig, setServerConfig] = useState<Record<string, string>>({}); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if desktop agent is running
        await axios.get('http://localhost:3004/health');

        // Fetch available servers from registry
        const serversRes = await axios.get(
          'https://raw.githubusercontent.com/hemangjoshi37a/mcphub/main/registry/servers.yaml',
          {
            transformResponse: [(data) => data] // Prevent axios from parsing the response
          }
        );

        // Parse YAML data
        const parsedData = yaml.load(serversRes.data) as RegistryData;
        if (!parsedData?.servers || !Array.isArray(parsedData.servers)) {
          throw new Error('Invalid server registry data');
        }
        setServers(parsedData.servers);

        // Fetch local config
        const configRes = await axios.get('http://localhost:3004/config');
        setConfig(configRes.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(
          err.message === 'Invalid server registry data'
            ? 'Failed to load server registry. Invalid data format.'
            : 'Failed to connect to desktop agent. Please make sure it\'s running.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const installServer = async (server: MCPServer) => {
    try {
      setInstallInProgress(server.name);
      setLoading(true);
      await axios.post('http://localhost:3004/install', server);
      
      // Refresh config
      const configRes = await axios.get('http://localhost:3004/config');
      setConfig(configRes.data);
      
      setError(null);
    } catch (err: any) {
      console.error('Installation error:', err);
      setError(`Failed to install ${server.name}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
      setInstallInProgress(null);
    }
  };

  const uninstallServer = async (serverName: string) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3004/uninstall/${serverName}`);
      
      // Refresh config
      const configRes = await axios.get('http://localhost:3004/config');
      setConfig(configRes.data);
      
      setError(null);
    } catch (err: any) {
      console.error('Uninstallation error:', err);
      setError(`Failed to uninstall ${serverName}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = (server: MCPServer) => {
    setSelectedServer(server);
    // Initialize server config with current values or defaults
    const currentConfig = config?.mcpServers?.[server.name] || {};
    setServerConfig({
      port: currentConfig.port?.toString() || server.default_config.port?.toString() || '8000',
      auth_token: currentConfig.auth_token || server.default_config.auth_token || '',
      ...Object.entries(server.default_config.env || {}).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: currentConfig.env?.[key] || value
      }), {})
    });
    setConfigDialogOpen(true);
  };

  const handleConfigSave = async () => {
    if (!selectedServer) return;

    try {
      const newConfig = {
        ...config,
        mcpServers: {
          ...config?.mcpServers,
          [selectedServer.name]: {
            ...config?.mcpServers?.[selectedServer.name],
            port: parseInt(serverConfig.port),
            auth_token: serverConfig.auth_token,
            env: Object.entries(serverConfig)
              .filter(([key]) => key !== 'port' && key !== 'auth_token')
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          }
        }
      };

      await axios.post('http://localhost:3004/config', { config: newConfig });
      setConfig(newConfig);
      setConfigDialogOpen(false);
      setError(null);
    } catch (err: any) {
      console.error('Config update error:', err);
      setError(`Failed to update configuration: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        MCPHub
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Available Servers
        </Typography>

        {servers && servers.length > 0 ? (
          servers.map((server) => (
            <Paper key={server.name} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{server.name}</Typography>
              <Typography color="text.secondary" paragraph>
                {server.description}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip label={`v${server.version}`} variant="outlined" size="small" />
                <Chip label={server.runtime} color="primary" variant="outlined" size="small" />
                {server.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="outlined" size="small" />
                ))}
              </Stack>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {config?.mcpServers?.[server.name] ? (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => openConfigDialog(server)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => uninstallServer(server.name)}
                    >
                      Uninstall
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => installServer(server)}
                    disabled={installInProgress === server.name}
                  >
                    {installInProgress === server.name ? 'Installing...' : 'Install'}
                  </Button>
                )}
              </Box>
            </Paper>
          ))
        ) : (
          <Alert severity="info">
            No servers available. Please check the server registry.
          </Alert>
        )}
      </Box>

      {selectedServer && (
        <Dialog
          open={configDialogOpen}
          onClose={() => setConfigDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Configure {selectedServer.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={serverConfig.port}
                onChange={(e) => setServerConfig(prev => ({ ...prev, port: e.target.value }))}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Auth Token"
                type="password"
                value={serverConfig.auth_token}
                onChange={(e) => setServerConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                sx={{ mb: 2 }}
              />
              {selectedServer.default_config.env && 
                Object.entries(selectedServer.default_config.env).map(([key, defaultValue]) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={key}
                    value={serverConfig[key] || defaultValue}
                    onChange={(e) => setServerConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    sx={{ mb: 2 }}
                  />
                ))
              }
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleConfigSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
