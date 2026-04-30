import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        reader: resolve(__dirname, "reader.html"),
        overlay: resolve(__dirname, "overlay.html"),
        popup: resolve(__dirname, "popup.html"),
        vocab: resolve(__dirname, "vocab.html"),
        background: resolve(__dirname, "src/background.js")
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") {
            return "[name].js";
          }
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
