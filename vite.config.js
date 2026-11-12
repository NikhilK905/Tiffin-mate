import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fixed port so the URL never silently moves when another app holds 5173/3000.
  server: { port: 5180, strictPort: true },
});
