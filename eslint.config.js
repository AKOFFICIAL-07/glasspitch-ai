import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  { ignores: ["dist", "src/convex/_generated"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          // Intentional non-component exports: shadcn cva variant styles and
          // deck helpers/hooks shipped alongside their components. These are
          // stable APIs — moving them to separate files would break imports
          // without any fast-refresh benefit (HMR is disabled in this project).
          allowExportNames: [
            "badgeVariants",
            "buttonVariants",
            "buttonGroupVariants",
            "toggleVariants",
            "navigationMenuTriggerStyle",
            "useFormField",
            "useSidebar",
            "useSlideNavigation",
            "useStageScale",
            "deckSlides",
            "slideLabel",
            "slideAccent",
          ],
        },
      ],
    },
  },
);
