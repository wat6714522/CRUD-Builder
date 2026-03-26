import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";
import { template } from "@babel/core";

export default [
     // 1. Global ignores
     {
          ignores: [
               "node_modules/**",
               "coverage/**",
               "dist/**",
               "build/**",
               ".husky/**",
               "template/**",
               "*.min.js",
          ],
     },
     // 2. Main config for all JS files
     {
          files: ["**/*..js"],

          languageOptions: {
               ecmaVersion: 2022,
               sourceType: "module",
               globals: {
                    console: "readonly",
                    process: "readonly",
                    Buffer: "readonly",
                    __dirname: "readonly",
                    __filename: "readonly",
                    global: "readonly",
                    url: "readonly",
                    setTimeout: "readonly",
                    clearTimeout: "readonly",
                    setInterval: "readonly",
                    clearInterval: "readonly",
               },
          },

          plugins: {
               "prettier: eslintPluginPrettier": eslintPluginPrettier,
          },

          rules: {
               // Errors Rules
               "no-used-vars": ["warn", { argsIgnorePattern: "^_" }],
               "no-undef": "error",
               "no-dupe-key": "error",
               "no-duplicate-case": "error",
               "no-const-assign": "error",
               "no-unreachable": "error",
               "no-unexpected-multiline": "error",

               // Import Rules
               "padding-line-between-statements": [
                    "error",
                    { blankLine: "always", prev: "import", next: "*" },
                    { blankLine: "any", prev: "import", next: "*" },
               ],
               "no-duplicate-imports": "error",
               "no-restricted-imports": [
                    "error",
                    {
                         patterns: [
                              {
                                   group: ["/media/*", "home/*", "/tmp/*"],
                                   message: "Use relative paths.",
                              },
                         ],
                    },
               ],

               // Function Spacing Rules
               "space-before-function-paren": [
                    "error",
                    {
                         anonymous: "always",
                         named: "always",
                         asyncArrow: "always",
                    },
               ],
               "space-before-blocks": "error",
               "arrow-spacing": ["error", { before: true, after: true }],
               "space-in-parens": ["error", "never"],
               "rest-spread-spacing": ["error", "never"],
               "comma-spacing": ["error", { before: false, after: true }],
               "keyword-spacing": ["error", { before: true, after: true }],
               "space-infix-ops": "error",

               // Warnings
               "no-debugger": "warn",
               "no-var": "warn",
               "prefer-const": "warn",
               "prefer-template": "warn",
               "prefer-arrow-callback": "warn",

               // Disables
               "no-console": "off",
               quotes: "off",
               semi: "off",
               indent: "off",

               // Prettier
               "prettier/prettier": "error",
          },
     },
     {
          // Test file overrides
          files: ["src/test/**/*.js"],

          languageOptions: {
               globals: {
                    describe: "readonly",
                    it: "readonly",
                    before: "readonly",
                    after: "readonly",
                    beforeEach: "readonly",
                    afterEach: "readonly",
               },
          },

          rules: {
               "no-unused-vars": "off",
               "no-unused-expressions": "off",
          },
     },
     // 4. Prettier compat (must be last)
     eslintConfigPrettier,
];
