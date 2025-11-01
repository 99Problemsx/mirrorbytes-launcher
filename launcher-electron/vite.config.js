import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Code-splitting and optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['framer-motion'],
          'icons-vendor': ['react-icons'],
          'charts-vendor': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit (from 500KB to 1000KB)
    chunkSizeWarningLimit: 1000,
    // Use esbuild minification (faster than terser)
    minify: 'esbuild',
    // Target modern browsers for better optimization
    target: 'es2020',
  },
  server: {
    port: 5173,
  },
});
