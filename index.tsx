import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process for the browser environment.
// This ensures that process.env.API_KEY is accessible even if not provided by a bundler.
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);