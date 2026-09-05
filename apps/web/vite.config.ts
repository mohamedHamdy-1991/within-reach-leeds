import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["robots.txt"],
      manifest: false, // static manifest.webmanifest in public/ is the source of truth
      workbox: {
        navigateFallback: "/index.html",
        // The offline shell promises the interface, never data: API calls are
        // excluded and the app states clearly when results are unavailable.
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,woff2,webmanifest}"],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    exclude: [...configDefaults.exclude, "e2e/**", "node_modules/**"],
  },
});
