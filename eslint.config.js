// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import effectPlugin from "@effect/eslint-plugin";
import functionalPlugin from "eslint-plugin-functional";
import importXPlugin from "eslint-plugin-import-x";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import unicornPlugin from "eslint-plugin-unicorn";
import promisePlugin from "eslint-plugin-promise";
import jsdocPlugin from "eslint-plugin-jsdoc";
import vitestPlugin from "@vitest/eslint-plugin";

export default tseslint.config(
  // ============================================
  // ベース設定（recommended使用）
  // ============================================
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ============================================
  // グローバル設定
  // ============================================
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ============================================
  // メインルール設定
  // ============================================
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "@effect": effectPlugin,
      functional: functionalPlugin,
      "import-x": importXPlugin,
      "unused-imports": unusedImportsPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
      promise: promisePlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // ========================================
      // TypeScript: strictTypeCheckedでカバーされないルールのみ追加
      // ========================================
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
      ],

      // ========================================
      // 関数型プログラミング: recommended + 追加ルール
      // ========================================
      ...functionalPlugin.configs.recommended.rules,
      "functional/no-throw-statements": "error",
      "functional/prefer-readonly-type": "error",
      "functional/no-mixed-types": "error",
      // Effect-TSのData.Classパターンを許可
      "functional/no-classes": "off",
      "functional/no-class-inheritance": "off",
      // ReadonlyDeepは厳格すぎるため無効化（prefer-readonly-typeで対応）
      "functional/prefer-immutable-types": "off",

      // ========================================
      // Import管理: recommended + 循環依存検出 + 順序
      // ========================================
      ...importXPlugin.configs.recommended.rules,
      // TypeScriptがimport解決を担当するため無効化
      "import-x/no-unresolved": "off",
      "import-x/no-cycle": ["error", { maxDepth: Infinity }],
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "type",
          ],
          pathGroups: [
            {
              pattern: "effect",
              group: "external",
              position: "before",
            },
            {
              pattern: "@effect/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@monorepo/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // ========================================
      // コード品質: SonarJS recommended使用
      // ========================================
      ...sonarjsPlugin.configs.recommended.rules,

      // ========================================
      // Unicorn: recommended + Effect-TS向け追加
      // ========================================
      ...unicornPlugin.configs.recommended.rules,
      "unicorn/no-null": "error", // Effect-TSではOption使用
      "unicorn/prefer-ternary": "error",
      // デモコードで緩和されるルールも明示的に設定
      "unicorn/filename-case": "off", // デモコードではPascalCase許可
      "unicorn/prevent-abbreviations": "off", // req/res/err等の略語を許可
      "unicorn/prefer-number-properties": "warn", // parseInt等を警告レベルに
      "unicorn/prefer-query-selector": "warn", // getElementById等を警告レベルに

      // ========================================
      // Promise: recommended + async/await推奨
      // ========================================
      ...promisePlugin.configs.recommended.rules,
      "promise/prefer-await-to-then": "error",
      "promise/prefer-await-to-callbacks": "error",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",

      // ========================================
      // JSDoc: recommended-typescript + 説明必須
      // ========================================
      ...jsdocPlugin.configs["recommended-typescript"].rules,
      "jsdoc/require-description": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-returns-description": "error",
    },
  },

  // ============================================
  // デモコード用の緩和設定
  // ============================================
  {
    files: [
      "packages/frontend/**/*",
      "packages/backend/**/*",
      "packages/shared/**/*",
    ],
    rules: {
      // 関数型プログラミングルールを緩和
      "functional/prefer-immutable-types": "off",
      "functional/immutable-data": "warn",
      "functional/no-let": "warn",
      "functional/no-loop-statements": "warn",
      "functional/no-throw-statements": "off",
      "functional/no-expression-statements": "off",
      "functional/functional-parameters": "off",
      "functional/no-return-void": "off",
      "functional/no-conditional-statements": "off",

      // SonarJSセキュリティルールを緩和
      "sonarjs/cors": "off",
      "sonarjs/x-powered-by": "off",
      "sonarjs/deprecation": "warn", // デモコードでの非推奨API使用を許可
      "sonarjs/slow-regex": "off", // デモコードのregexは許可

      // JSDoc要件を緩和
      "jsdoc/require-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
      "jsdoc/require-jsdoc": "off",

      // React component importでPascalCaseを許可
      "@typescript-eslint/naming-convention": "off",

      // TypeScript厳格ルールを警告に緩和
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/no-confusing-void-expression": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/strict-boolean-expressions": "warn",
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",

      // その他の厳格ルールを緩和
      "unicorn/no-null": "warn",
      "unused-imports/no-unused-vars": "warn",

      // Effect-TSパターンを許可
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
    },
  },

  // ============================================
  // Effect-TS クライアントパッケージ用設定
  // ============================================
  {
    files: ["packages/toggl-client/**/*", "packages/notion-client/**/*"],
    rules: {
      // 外部API (Notion/Toggl) のsnake_caseプロパティを許可
      "@typescript-eslint/naming-convention": "off",

      // Effect.genパターンでパラメータなし関数を許可
      "functional/functional-parameters": "off",

      // Data.Classのspreadパターンを許可
      "@typescript-eslint/no-misused-spread": "off",

      // 外部APIでnullが必要な場合を許可
      "unicorn/no-null": "warn",

      // JSDocパラメータ説明を緩和
      "jsdoc/require-param-description": "off",

      // Unicorn strictルールを緩和
      "unicorn/switch-case-braces": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-negated-condition": "off",

      // Functional programming ルールを緩和
      "functional/no-loop-statements": "warn", // 外部APIレスポンス処理でループが必要な場合あり
      "functional/no-expression-statements": "warn", // Domain errorsでthrowが必要

      // SonarJS strictルールを緩和
      "sonarjs/no-nested-functions": "off",
      "sonarjs/no-nested-template-literals": "off",
      "sonarjs/slow-regex": "off", // Domain validation regexは許可
      "sonarjs/different-types-comparison": "warn",
      "sonarjs/deprecation": "warn",
      "sonarjs/no-unused-vars": "off", // TypeScriptのno-unused-varsを使用

      // テンプレートリテラルでnumber型を許可
      "@typescript-eslint/restrict-template-expressions": "warn",

      // 条件式の型チェックを緩和
      "@typescript-eslint/no-unnecessary-condition": "warn",

      // 未使用変数を警告に（APIレスポンスの分割代入で使わない値がある場合）
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // ============================================
  // テストファイル用設定
  // ============================================
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      // JSDoc不要
      "jsdoc/require-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
      // 関数型プログラミングルールを緩和（テストでは副作用が必要）
      "functional/no-expression-statements": "off",
      "functional/functional-parameters": "off",
      "functional/no-return-void": "off",
      "functional/no-conditional-statements": "off",
    },
  },

  // ============================================
  // 除外設定
  // ============================================
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.ts",
    ],
  },
);
