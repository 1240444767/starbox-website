/// <reference types="vitest" />

import analog from "@analogjs/platform";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  build: {
    target: ["es2020"],
  },
  resolve: {
    mainFields: ["module"],
  },
  plugins: [
    analog({
      prerender: {
        routes: [
          "/",
          "/download",
          "/admire",
          "/tip",
          "/docs/privacy",
          "/docs/terms",
        ],
        sitemap: {
          host: "https://istarbox.app",
        },
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: ["**/*.spec.ts"],
    exclude: ["**/node_modules/**", "**/.git/**", "dist/**"],
    reporters: ["default"],
  },
}));
