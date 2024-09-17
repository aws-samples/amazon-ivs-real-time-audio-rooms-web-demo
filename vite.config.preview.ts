import path from 'path';
import * as vite from 'vite';

const port = Number(process.env.PORT) || 3000;

// Minimal Vite preview config
const viteConfig = vite.defineConfig({
  build: { outDir: path.resolve(process.cwd(), 'build') },
  preview: { port, strictPort: true, open: '/' }
});

export default viteConfig;
