import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path in tsconfig.json.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    // .cache holds Puppeteer's Chrome download; never scan it for tests.
    exclude: [...configDefaults.exclude, ".cache/**", ".next/**"],
  },
});
