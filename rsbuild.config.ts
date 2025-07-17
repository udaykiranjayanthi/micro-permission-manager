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
    },
  },
});
