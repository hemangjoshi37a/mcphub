// ... (previous imports remain the same)
import { checkExtension, getConfig, updateConfig, installServer as installServerAgent, uninstallServer as uninstallServerAgent } from '../utils/desktopAgent';

// ... (interfaces remain the same)

export default function Home() {
  // ... (previous state declarations remain the same)
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    const checkDesktopAgent = async () => {
      const isInstalled = await checkExtension();
      setExtensionInstalled(isInstalled);

      if (isInstalled) {
        try {
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

          // Get config from extension
          const configData = await getConfig();
          setConfig(configData);
        } catch (err: any) {
          console.error('Error fetching data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setError('Desktop agent extension not installed. Please install the extension to use MCPHub.');
        setLoading(false);
      }
    };

    checkDesktopAgent();
    const interval = setInterval(checkDesktopAgent, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const installServer = async (server: MCPServer) => {
    if (!extensionInstalled) {
      setError('Desktop agent extension not installed');
      return;
    }

    try {
      setInstallInProgress(server.name);
      await installServerAgent(server);
      const configData = await getConfig();
      setConfig(configData);
      setError(null);
    } catch (err: any) {
      console.error('Installation error:', err);
      setError(err.message);
    } finally {
      setInstallInProgress(null);
    }
  };

  const uninstallServer = async (serverName: string) => {
    if (!extensionInstalled) {
      setError('Desktop agent extension not installed');
      return;
    }

    try {
      await uninstallServerAgent(serverName);
      const configData = await getConfig();
      setConfig(configData);
      setError(null);
    } catch (err: any) {
      console.error('Uninstallation error:', err);
      setError(err.message);
    }
  };

  const handleConfigSave = async () => {
    if (!selectedServer || !extensionInstalled) return;

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

      await updateConfig(newConfig);
      setConfig(newConfig);
      setConfigDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ... (rest of the component remains the same)
}
