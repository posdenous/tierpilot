import netlifyPlugin from '@netlify/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [netlifyPlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
