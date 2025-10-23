import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import oxlint from "vite-plugin-oxlint";

export default defineConfig({
  plugins: [
    react(),
    oxlint({
      path: "src",
      // Oxlintを開発時にリアルタイム実行
      includes: ["**/*.ts", "**/*.tsx"],
      // エラーをブラウザに表示
      dev: {
        overlay: true,
      },
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
