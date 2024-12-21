import type { AppProps } from 'next/app';
import { StyledEngineProvider } from '@mui/material/styles';
import { ThemeProvider } from '../components/ThemeProvider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
