import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSass } from "@rsbuild/plugin-sass";

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],

  html: {
    template: "./public/index.html",
  },

  source: {
    entry: {
      popup: "./src/popup/index.tsx",
      content: {
        import: "./src/content-scripts/content.ts",
        html: false,
        filename: "content.js",
      },
      injected: {
        import: "./src/content-scripts/injected.ts",
        html: false,
        filename: "injected.js",
      },
      background: {
        import: "./src/background/background.js",
        html: false,
        filename: "background.js",
      },
    },
  },
  output: {
    cleanDistPath: true,
  },
});
