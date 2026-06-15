/**
 * @file vitest.config.ts
 * @description Vitest test runner configuration.
 * Uses jsdom for DOM simulation, vite-tsconfig-paths for path aliases,
 * and @testing-library/jest-dom for enhanced matchers.
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    /** Use jsdom to simulate browser environment */
    environment: "jsdom",
    /** Global setup — imports jest-dom matchers (toBeInTheDocument, etc.) */
    setupFiles: ["./src/test/setup.ts"],
    /** Enable global test utilities without explicit imports */
    globals: true,
    /** Coverage configuration */
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      /** Files to include in coverage analysis */
      include: ["src/**/*.{ts,tsx}"],
      /** Files to exclude */
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/app/api/**",
        "src/types/**",
      ],
      /** Minimum coverage thresholds */
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
