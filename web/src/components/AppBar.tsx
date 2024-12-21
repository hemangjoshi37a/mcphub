import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTheme } from './ThemeProvider';

export function AppBar() {
  const { mode, toggleMode } = useTheme();

  return (
    <MuiAppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          MCPHub
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            startIcon={<DownloadIcon />}
            href="https://github.com/hemangjoshi37a/mcphub#desktop-agent-setup"
            target="_blank"
            color="inherit"
          >
            Desktop Agent
          </Button>

          <Tooltip title="View on GitHub">
            <IconButton
              color="inherit"
              href="https://github.com/hemangjoshi37a/mcphub"
              target="_blank"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
