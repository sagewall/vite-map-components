import { bundleStats } from "rollup-plugin-bundle-stats";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 3072,
    rollupOptions: {
      output: {
        // manualChunks: (id) => {
        //   if (id.includes("node_modules/@arcgis")) {
        //     return "arcgis";
        //   }
        // },
      },
    },
  },
  plugins: [
    bundleStats({
      baseline: true,
    }),
    visualizer({
      brotliSize: true,
      emitFile: true,
      filename: "stats.html",
      gzipSize: true,
      template: "sunburst",
    }),
  ],
});
