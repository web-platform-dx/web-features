import newWithError from "eslint-plugin-new-with-error";
import tseslint from "typescript-eslint";

export default tseslint.config(tseslint.configs.base, {
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
});

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
