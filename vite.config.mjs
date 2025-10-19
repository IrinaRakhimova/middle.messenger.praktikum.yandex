import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    sourcemap: false,
    target: 'esnext',   
    minify: 'esbuild',  
  },
  server: {
    port: 3000,
    host: true,
  },
});

