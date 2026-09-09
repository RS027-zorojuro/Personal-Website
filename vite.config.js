import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The site's artwork and vehicle models live in /assets, which is referenced
 * by absolute URL from both index.html's vanilla JS and the React worlds.
 *
 * publicDir is false because Vite's public-dir convention would flatten
 * /assets/anime/x.jpg to /anime/x.jpg and break every one of those paths.
 * Instead the directory is copied verbatim after the bundle is written, so
 * built output resolves at exactly the same URLs as the dev server.
 */
function copyAssets() {
  return {
    name: 'copy-site-assets',
    apply: 'build',
    async closeBundle() {
      const from = resolve(import.meta.dirname, 'assets');
      if (!existsSync(from)) return;
      await cp(from, resolve(import.meta.dirname, 'dist/assets'), {
        recursive: true,
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages serves this repo as a project site at
  // https://<user>.github.io/Personal-Website/ — every built asset URL
  // needs that prefix there, or the deployed page 404s on its own JS/CSS/
  // images. Locally, `npm run build` + `npm run preview` (and `npm run dev`)
  // have no such prefix and need to stay at "/" — vite preview reports
  // command:"serve" just like dev does, so branching on `command` here
  // would silently break local preview. Only the CI workflow sets
  // VITE_BASE_PATH, so local builds/previews are unaffected.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), copyAssets()],
  // The existing index.html is the entry point;
  // Vite injects the module script automatically.
  build: {
    outDir: 'dist',
    assetsDir: 'bundle',
    rollupOptions: {
      output: {
        /**
         * Vite 8 runs Rolldown, which requires manualChunks to be a function —
         * the previous object form failed the build outright with
         * "manualChunks is not a function".
         *
         * Three.js and R3F are split out so the ~600 KB 3D stack is fetched
         * only when the Cars world is actually reached, not on first paint.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) {
            return 'three-vendor';
          }
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  publicDir: false,
});
