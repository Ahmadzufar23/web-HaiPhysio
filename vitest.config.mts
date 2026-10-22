import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit test untuk fungsi murni (lib/, helper booking). Alias "@/..." sama dengan tsconfig.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
