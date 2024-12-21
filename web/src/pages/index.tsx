// Previous imports remain same
import { ExtensionCheck } from '../components/ExtensionCheck';

// Add extension ID constant
const EXTENSION_ID = 'your-extension-id'; // Replace with actual ID after publishing

export default function Home() {
  // ... previous state declarations
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    const checkExtension = async () => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
          setExtensionInstalled(false);
          return;
        }

        // Try to communicate with the extension
        await chrome.runtime.sendMessage(EXTENSION_ID, { type: 'PING' });
        setExtensionInstalled(true);

        // Continue with data fetching if extension is installed
        await fetchData();
      } catch (err) {
        setExtensionInstalled(false);
      } finally {
        setLoading(false);
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // ... rest of your existing code

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!extensionInstalled) {
    return <ExtensionCheck isInstalled={false} extensionId={EXTENSION_ID} />;
  }

  return (
    <Box>
      <AppBar />
      <Toolbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <ExtensionCheck isInstalled={true} extensionId={EXTENSION_ID} />
        </Box>
        
        {/* Rest of your existing JSX */}
      </Container>
    </Box>
  );
}
