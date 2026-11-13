import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // shadcn CLI output. These files are generated (`pnpm dlx shadcn@latest add`)
    // and re-written on upgrade, so they are not hand-maintained. The shadcn
    // carousel calls the Embla callback inside an effect, which the new
    // react-hooks rule flags; patching it would drift from upstream. Our own
    // code (app/, components/<domain>/, hooks/, lib/) is still fully linted.
    files: ["components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
