import { defineConfig } from "@rsbuild/core";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  output: {
    filenameHash: false,
  },
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
        import: "./src/popup/index.tsx",
        html: true,
      },
      options: {
        import: "./src/options/index.tsx",
        html: true,
      },
    },
  },
  html: {
    title: "Micro Permission Manager",
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
