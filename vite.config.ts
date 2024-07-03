import { bundleStats } from "rollup-plugin-bundle-stats";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1024,
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
