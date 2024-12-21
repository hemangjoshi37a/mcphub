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
  DialogActions
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
      setLoading(true);
      await axios.post('http://localhost:3004/install', server);
      
      // Refresh config
      const configRes = await axios.get('http://localhost:3004/config');
      setConfig(configRes.data);
      
      setError(null);
    } catch (err) {
      setError(`Failed to install ${server.name}`);
      console.error('Installation error:', err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      setError(`Failed to uninstall ${serverName}`);
      console.error('Uninstallation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = (server: MCPServer) => {
    setSelectedServer(server);
    setConfigDialogOpen(true);
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Version: {server.version} | Runtime: {server.runtime}
              </Typography>
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
                  >
                    Install
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
                defaultValue={selectedServer.default_config.port}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Auth Token"
                type="password"
                defaultValue={selectedServer.default_config.auth_token}
                sx={{ mb: 2 }}
              />
              {selectedServer.default_config.env && (
                Object.entries(selectedServer.default_config.env).map(([key, value]) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={key}
                    defaultValue={value}
                    sx={{ mb: 2 }}
                  />
                ))
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setConfigDialogOpen(false)}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}
