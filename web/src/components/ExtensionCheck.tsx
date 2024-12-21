import { Box, Button, Typography } from '@mui/material';
import { Extension as ExtensionIcon, Check as CheckIcon } from '@mui/icons-material';

interface ExtensionCheckProps {
  isInstalled: boolean;
  extensionId: string;
}

export function ExtensionCheck({ isInstalled, extensionId }: ExtensionCheckProps) {
  const CHROME_STORE_URL = `https://chrome.google.com/webstore/detail/mcphub-desktop-agent/${extensionId}`;

  if (isInstalled) {
    return (
      <Box 
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          pl: 2,
          pr: 2,
          borderRadius: 2,
          bgcolor: 'success.light',
          color: 'success.contrastText'
        }}
      >
        <CheckIcon />
        <Typography>Desktop Agent Extension Installed</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        textAlign: 'center',
        p: 4
      }}
    >
      <ExtensionIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      
      <Typography variant="h4" component="h1" gutterBottom>
        MCPHub Desktop Agent Required
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mb: 4 }}>
        To manage MCP servers on your system, you need to install the MCPHub Desktop Agent extension from the Chrome Web Store.
      </Typography>

      <Button
        variant="contained"
        size="large"
        href={CHROME_STORE_URL}
        target="_blank"
        startIcon={<ExtensionIcon />}
        sx={{
          minWidth: 250,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1.1rem',
          p: 2
        }}
      >
        Install Extension
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        After installation, refresh this page to continue
      </Typography>
    </Box>
  );
}
