import { defineConfig } from "@rsbuild/core";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  source: {
    entry: {
      background: {
        import: "./src/scripts/background.ts",
        html: false,
        filename: "background.js",
      },
      content: {
        import: "./src/scripts/content.ts",
        html: false,
        filename: "content.js",
      },
      injected: {
        import: "./src/scripts/injected.ts",
        html: false,
        filename: "injected.js",
      },
      popup: {
        import: "./src/scripts/popup.ts",
        html: false,
        filename: "popup.js",
      },
      popupTsx: {
        import: "./src/popup/index.tsx",
      },
    },
  },
  plugins: [pluginSass(), pluginReact()],
  tools: {
    rspack: {
      optimization: {
        splitChunks: false,
      },
    },
  },
});
