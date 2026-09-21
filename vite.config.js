import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built app also works when served from a subfolder
// (GitHub Pages, a USB stick, or just opening dist/index.html).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, open: true },
});
