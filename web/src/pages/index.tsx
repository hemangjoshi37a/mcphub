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
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Tooltip,
  Toolbar,
} from '@mui/material';
import { Settings as SettingsIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import yaml from 'js-yaml';
import { AppBar } from '@/components/AppBar';

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
        // Check if desktop agent is running and get config
        const configRes = await axios.get('http://localhost:3004/config');
        setConfig(configRes.data);

        // Fetch available servers from registry
        const serversRes = await axios.get(
          'https://raw.githubusercontent.com/hemangjoshi37a/mcphub/main/registry/servers.yaml',
          {
            transformResponse: [(data) => data]
          }
        );

        // Parse YAML data
        const parsedData = yaml.load(serversRes.data) as RegistryData;
        if (!parsedData?.servers || !Array.isArray(parsedData.servers)) {
          throw new Error('Invalid server registry data');
        }
        setServers(parsedData.servers);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (err.message === 'Invalid server registry data') {
          setError('Failed to load server registry. Invalid data format.');
        } else if (err.code === 'ECONNREFUSED') {
          setError('Failed to connect to desktop agent. Please make sure it\'s running.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const installServer = async (server: MCPServer) => {
    try {
      setInstallInProgress(server.name);
      await axios.post('http://localhost:3004/install', server);
      const configRes = await axios.get('http://localhost:3004/config');
      setConfig(configRes.data);
      setError(null);
    } catch (err: any) {
      console.error('Installation error:', err);
      setError(`Failed to install ${server.name}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setInstallInProgress(null);
    }
  };

  const uninstallServer = async (serverName: string) => {
    try {
      await axios.delete(`http://localhost:3004/uninstall/${serverName}`);
      const configRes = await axios.get('http://localhost:3004/config');
      setConfig(configRes.data);
      setError(null);
    } catch (err: any) {
      console.error('Uninstallation error:', err);
      setError(`Failed to uninstall ${serverName}: ${err.response?.data?.detail || err.message}`);
    }
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
      setError(`Failed to update configuration: ${err.response?.data?.detail || err.message}`);
    }
  };

  const openConfigDialog = (server: MCPServer) => {
    setSelectedServer(server);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBar />
      <Toolbar /> {/* Spacer for fixed AppBar */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {servers && servers.length > 0 ? (
            servers.map((server) => (
              <Grid item xs={12} sm={6} md={4} key={server.name}>
                <Card 
                  elevation={1} 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                          {server.name}
                        </Typography>
                        <Chip 
                          label={`v${server.version}`} 
                          size="small" 
                          sx={{ mr: 1, bgcolor: 'primary.main', color: 'white' }}
                        />
                        <Chip 
                          label={server.runtime} 
                          size="small"
                          sx={{ bgcolor: server.runtime === 'python' ? '#3776AB' : '#339933', color: 'white' }} 
                        />
                      </Box>
                    </Box>
                    
                    <Typography color="text.secondary" sx={{ mb: 2, minHeight: '2.5em' }}>
                      {server.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {server.tags.map((tag) => (
                        <Chip 
                          key={tag} 
                          label={tag} 
                          size="small" 
                          variant="outlined" 
                          sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}
                        />
                      ))}
                    </Stack>
                  </CardContent>

                  <Divider />
                  
                  <CardActions sx={{ p: 2, bgcolor: 'background.default' }}>
                    {config?.mcpServers?.[server.name] ? (
                      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Tooltip title="Configure">
                          <IconButton 
                            onClick={() => openConfigDialog(server)}
                            color="primary"
                            size="small"
                          >
                            <SettingsIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Uninstall">
                          <IconButton 
                            onClick={() => uninstallServer(server.name)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => installServer(server)}
                        disabled={installInProgress === server.name}
                        sx={{ 
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 1 }
                        }}
                      >
                        {installInProgress === server.name ? 'Installing...' : 'Install'}
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                No servers available. Please check the server registry.
              </Alert>
            </Grid>
          )}
        </Grid>

        {selectedServer && (
          <Dialog
            open={configDialogOpen}
            onClose={() => setConfigDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              elevation: 2,
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
              Configure {selectedServer.name}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Port"
                  type="number"
                  value={serverConfig.port}
                  onChange={(e) => setServerConfig(prev => ({ ...prev, port: e.target.value }))}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Auth Token"
                  type="password"
                  value={serverConfig.auth_token}
                  onChange={(e) => setServerConfig(prev => ({ ...prev, auth_token: e.target.value }))}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                {selectedServer.default_config.env && 
                  Object.entries(selectedServer.default_config.env).map(([key, defaultValue]) => (
                    <TextField
                      key={key}
                      label={key}
                      value={serverConfig[key] || defaultValue}
                      onChange={(e) => setServerConfig(prev => ({ ...prev, [key]: e.target.value }))}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={() => setConfigDialogOpen(false)}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleConfigSave}
                sx={{ 
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 1 }
                }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </Box>
  );
}
