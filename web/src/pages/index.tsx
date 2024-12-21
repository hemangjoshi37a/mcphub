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

interface MCPServer {
  name: string;
  description: string;
  runtime: string;
  package: string;
  version: string;
  command_args: string[];
  env?: Record<string, string>;
}

interface Config {
  mcpServers: Record<string, any>;
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
        await axios.get('http://localhost:3000/health');

        // Fetch available servers from registry
        const serversRes = await axios.get(
          'https://raw.githubusercontent.com/hemangjoshi37a/mcphub/main/registry/servers.yaml'
        );
        setServers(serversRes.data.servers);

        // Fetch local config
        const configRes = await axios.get('http://localhost:3000/config');
        setConfig(configRes.data);
      } catch (err) {
        setError(
          'Failed to connect to desktop agent. Please make sure it\'s running.'
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
      await axios.post('http://localhost:3000/install', server);
      
      // Refresh config
      const configRes = await axios.get('http://localhost:3000/config');
      setConfig(configRes.data);
      
      setError(null);
    } catch (err) {
      setError(`Failed to install ${server.name}`);
    } finally {
      setLoading(false);
    }
  };

  const uninstallServer = async (serverName: string) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/uninstall/${serverName}`);
      
      // Refresh config
      const configRes = await axios.get('http://localhost:3000/config');
      setConfig(configRes.data);
      
      setError(null);
    } catch (err) {
      setError(`Failed to uninstall ${serverName}`);
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

        {servers.map((server) => (
          <Paper key={server.name} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{server.name}</Typography>
            <Typography color="text.secondary" paragraph>
              {server.description}
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
        ))}
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
            {/* Add configuration fields based on server.env */}
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
