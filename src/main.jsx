import React from 'react';
import ReactDOM from 'react-dom/client';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import './theme/fonts.css';
import App from './App';
import AdminApp from './admin/AdminApp';

// No routing library — there are only two route shapes: the internal
// generator tool at /interno, and a public offer at /oferta/<slug>. A
// plain path switch keeps the public bundle free of router code.
const path = window.location.pathname;
const offerMatch = path.match(/^\/oferta\/([^/]+)\/?$/);
const isAdminRoute = path === '/interno' || path.startsWith('/interno/');

function Root() {
  if (isAdminRoute) return <AdminApp />;
  return <App slug={offerMatch ? decodeURIComponent(offerMatch[1]) : null} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root />
    </ThemeProvider>
  </React.StrictMode>
);
