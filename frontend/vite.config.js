import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Keeps your port the same as CRA
    open: true, // Opens the browser automatically
  },
  optimizeDeps: {
    include: ['tslib', '@uploadthing/react'],
  },
});
