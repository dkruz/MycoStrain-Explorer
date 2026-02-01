import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This trick injects the key into the code even if it doesn't start with VITE_
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.GOOGLE_API_KEY),
    'process.env.GOOGLE_API_KEY': JSON.stringify(process.env.API_KEY || process.env.GOOGLE_API_KEY),
  },
  server: {
    port: 8080,
    strictPort: true,
    host: true,
  },
});
