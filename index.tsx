import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize a minimal process.env shim if it doesn't exist
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || {};
  (window as any).process.env = (window as any).process.env || {};
  
  // If the platform provides keys globally, sync them to our shim
  const globalApiKey = (window as any).API_KEY || (window as any).GOOGLE_API_KEY;
  if (globalApiKey && !(window as any).process.env.API_KEY) {
    (window as any).process.env.API_KEY = globalApiKey;
  }
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