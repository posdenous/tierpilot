import netlifyPlugin from '@netlify/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/tierpilot/' : '/',
  plugins: [netlifyPlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
