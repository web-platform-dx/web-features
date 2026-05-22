import newWithError from "eslint-plugin-new-with-error";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  tseslint.configs.base,
  {
    plugins: { newWithError },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          caughtErrors: "none",
        },
      ],
      "newWithError/new-with-error": "error",
      "no-duplicate-imports": "error",
      "no-throw-literal": "error",
    },
    files: ["**/*.ts"],
  },
  globalIgnores(["packages/web-features/**/*.js"]),
);

// TODO: do linting more comprehensively, something like:
// import eslint from "@eslint/js";
// export default tseslint.config(
//   eslint.configs.recommendedTypeChecked,
//   ...tseslint.configs.recommended,
//   {
//     plugins: { newWithError },
//     rules: {
//       "no-throw-literal": "error",
//       "newWithError/new-with-error": "error",
//   },
// );
