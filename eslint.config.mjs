import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    // Experimental snippets and captured output, not application source.
    "scratch/**",
  ]),
  {
    rules: {
      // This is a gradual TypeScript migration. `tsc --noEmit` remains the
      // release type-safety gate while application types are tightened.
      "@typescript-eslint/no-explicit-any": "off",
      // Editorial French copy is intentionally written directly in JSX.
      "react/no-unescaped-entities": "off",
      // These React Compiler adoption rules are not enabled for this project
      // yet. Keep the standard Rules of Hooks checks enabled.
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    files: ["scripts/**/*.{js,cjs,mjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
