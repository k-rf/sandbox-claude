// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import effectPlugin from '@effect/eslint-plugin';
import functionalPlugin from 'eslint-plugin-functional';
import importXPlugin from 'eslint-plugin-import-x';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import unicornPlugin from 'eslint-plugin-unicorn';
import promisePlugin from 'eslint-plugin-promise';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import vitestPlugin from '@vitest/eslint-plugin';

export default tseslint.config(
  // ベース設定
  eslint.configs.recommended,

  // TypeScript strict-type-checked（最も厳格）
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // グローバル設定
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // メインルール設定
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@effect': effectPlugin,
      functional: functionalPlugin,
      'import-x': importXPlugin,
      'unused-imports': unusedImportsPlugin,
      sonarjs: sonarjsPlugin,
      unicorn: unicornPlugin,
      promise: promisePlugin,
      jsdoc: jsdocPlugin,
    },
    rules: {
      // ========================================
      // TypeScript厳格ルール
      // ========================================
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
      ],

      // ========================================
      // 関数型プログラミング（厳格）
      // ========================================
      'functional/no-let': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-throw-statements': 'error',
      'functional/prefer-immutable-types': [
        'error',
        {
          enforcement: 'ReadonlyDeep',
          ignoreInferredTypes: false,
        },
      ],
      'functional/prefer-readonly-type': 'error',
      'functional/immutable-data': 'error',
      'functional/no-mixed-types': 'error',

      // ========================================
      // Import/Export管理
      // ========================================
      'import-x/no-unresolved': 'error',
      'import-x/named': 'error',
      'import-x/default': 'error',
      'import-x/namespace': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-cycle': ['error', { maxDepth: Infinity }],
      'import-x/no-useless-path-segments': 'error',
      'import-x/no-deprecated': 'warn',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-unused-modules': ['error', { unusedExports: true }],
      'import-x/first': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: 'effect',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@effect/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@monorepo/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // 未使用import削除
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ========================================
      // コード品質（SonarJS）
      // ========================================
      'sonarjs/cognitive-complexity': ['error', 15],
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-unused-collection': 'error',
      'sonarjs/prefer-immediate-return': 'error',

      // ========================================
      // Unicorn（モダンなベストプラクティス）
      // ========================================
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/error-message': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-null': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/throw-new-error': 'error',

      // ========================================
      // Promise
      // ========================================
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/prefer-await-to-then': 'error',
      'promise/prefer-await-to-callbacks': 'error',

      // ========================================
      // JSDoc（必須）
      // ========================================
      'jsdoc/check-access': 'error',
      'jsdoc/check-alignment': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-property-names': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-returns-type': 'error',
    },
  },

  // テストファイル用設定
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-focused-tests': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/valid-expect': 'error',

      // テストファイルではJSDoc不要
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
    },
  },

  // 設定ファイルは除外
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  }
);
