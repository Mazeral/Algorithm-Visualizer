import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig(({ mode }) => { // Receive the 'mode' argument
  const env = loadEnv(mode, process.cwd()); // Load environment variables

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    base: env.NODE_ENV === 'production'
      ? `/${env.Algorithm-Visualizer}/` // Replace with your actual repository name
      : '/',
  };
});
