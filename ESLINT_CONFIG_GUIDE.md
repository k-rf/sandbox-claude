# ESLint設定ガイド

このドキュメントでは、プロジェクトのESLint設定の各項目について、**なぜその設定を行ったか**と、**各プラグインのrecommendedで対応可能かどうか**を詳しく解説します。

## 目次

1. [ベース設定](#ベース設定)
2. [TypeScript厳格ルール](#typescript厳格ルール)
3. [関数型プログラミング](#関数型プログラミング)
4. [Import/Export管理](#importexport管理)
5. [コード品質（SonarJS）](#コード品質sonarjs)
6. [Unicorn（モダンなベストプラクティス）](#unicornモダンなベストプラクティス)
7. [Promise](#promise)
8. [JSDoc](#jsdoc)
9. [Vitest（テスト）](#vitestテスト)
10. [推奨される改善案](#推奨される改善案)

---

## ベース設定

### 現在の設定

```javascript
eslint.configs.recommended,
...tseslint.configs.strictTypeChecked,
...tseslint.configs.stylisticTypeChecked,
```

### 設定理由

| 設定 | 理由 | recommendedで対応可能か |
|------|------|----------------------|
| `eslint.configs.recommended` | ESLintの基本的なエラー検出ルール（構文エラー、未定義変数等） | ✅ これ自体がrecommended |
| `strictTypeChecked` | TypeScriptの型安全性を最大限に活用するため。型エラーの早期検出が目的 | ✅ これ自体がpresetの一種 |
| `stylisticTypeChecked` | 型に関するスタイルの一貫性（型アサーション、型import等） | ✅ これ自体がpresetの一種 |

**判定**: ✅ **適切** - これらはすべてpresetであり、手動設定より推奨される方法です。

---

## TypeScript厳格ルール

### 現在の設定（46-91行目）

```javascript
"@typescript-eslint/explicit-function-return-type": "error",
"@typescript-eslint/explicit-module-boundary-types": "error",
// ... など19個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | strictTypeCheckedで対応可能か |
|--------|---------|---------------------------|
| `explicit-function-return-type` | 関数の戻り値型を明示して型推論ミスを防ぐ。Effect-TSでは特に重要 | ❌ strictには含まれない（手動設定必要） |
| `explicit-module-boundary-types` | モジュール境界での型を明示してAPI仕様を明確化 | ❌ strictには含まれない |
| `no-explicit-any` | `any`型の使用禁止で型安全性を保証 | ✅ strictに含まれる |
| `no-unsafe-*` 系（4個） | `any`型の値に対する操作を禁止 | ✅ strictに含まれる |
| `strict-boolean-expressions` | boolean以外の値を条件式で使わない（`if (str)`等を禁止） | ✅ strictに含まれる |
| `no-floating-promises` | Promiseの結果を必ずハンドリング（Effect-TSで必須） | ✅ strictに含まれる |
| `no-misused-promises` | Promiseを誤った場所で使用しない | ✅ strictに含まれる |
| `await-thenable` | awaitできるものだけをawait | ✅ strictに含まれる |
| `no-unnecessary-type-assertion` | 不要な型アサーションを禁止 | ✅ strictに含まれる |
| `prefer-nullish-coalescing` | `??`を`||`より優先（nullとundefinedの区別） | ✅ stylisticに含まれる |
| `prefer-optional-chain` | オプショナルチェーン`?.`の使用を推奨 | ✅ stylisticに含まれる |
| `switch-exhaustiveness-check` | switchで全ケースを網羅させる（ユニオン型で重要） | ❌ strictには含まれない |
| `consistent-type-imports` | 型importと値importを分離（`import type`） | ❌ stylisticには含まれない |
| `consistent-type-exports` | 型exportの一貫性 | ❌ stylisticには含まれない |
| `naming-convention` | 命名規則の強制（camelCase, PascalCase等） | ❌ どのpresetにも含まれない |

**判定**:
- ✅ **19個中11個はstrictTypeCheckedで対応可能**
- ❌ **8個は手動設定が必要**（特に`explicit-function-return-type`, `switch-exhaustiveness-check`, `consistent-type-imports`, `naming-convention`は重要）

**推奨**:
```javascript
// strictTypeChecked + 追加で必要なルールのみ手動設定
{
  rules: {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/naming-convention": [ /* ... */ ],
  }
}
```

---

## 関数型プログラミング

### 現在の設定（94-107行目）

```javascript
"functional/no-let": "error",
"functional/no-loop-statements": "error",
"functional/no-throw-statements": "error",
"functional/prefer-immutable-types": "error",
"functional/prefer-readonly-type": "error",
"functional/immutable-data": "error",
"functional/no-mixed-types": "error",
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `no-let` | `let`を禁止して変数の再代入を防ぐ（immutability強制） | ✅ `recommended`に含まれる |
| `no-loop-statements` | `for`ループを禁止して`map/filter/reduce`を推奨 | ✅ `recommended`に含まれる |
| `no-throw-statements` | `throw`を禁止してEffect-TSのエラーハンドリングを強制 | ❌ `recommended`に含まれない |
| `prefer-immutable-types` | 型レベルでimmutabilityを強制（`readonly`を必須化） | ❌ `recommended`に含まれない（非常に厳格） |
| `prefer-readonly-type` | 配列/タプルを`readonly`にする | ❌ `recommended`に含まれない |
| `immutable-data` | オブジェクトの変更を禁止（`obj.prop = val`等） | ✅ `recommended`に含まれる |
| `no-mixed-types` | 型とインターフェースの混在を禁止 | ❌ `recommended`に含まれない |

**判定**:
- ✅ **7個中3個は`functional/recommended`で対応可能**
- ❌ **4個は`functional/strict`または手動設定が必要**

**eslint-plugin-functionalのpresets**:
- `recommended`: 基本的な関数型ルール
- `lite`: 軽量版
- `strict`: 最も厳格（Effect-TSプロジェクトに最適）

**推奨**:
```javascript
// eslint-plugin-functional/strict を使用
import functionalPlugin from "eslint-plugin-functional";

{
  plugins: {
    functional: functionalPlugin,
  },
  rules: {
    ...functionalPlugin.configs.strict.rules,
    // カスタマイズが必要なら上書き
    "functional/prefer-immutable-types": [
      "error",
      {
        enforcement: "ReadonlyDeep",
        ignoreInferredTypes: false,
      },
    ],
  },
}
```

---

## Import/Export管理

### 現在の設定（111-163行目）

```javascript
"import-x/no-unresolved": "error",
"import-x/no-cycle": ["error", { maxDepth: Infinity }],
"import-x/order": [ /* 複雑な設定 */ ],
// ... など14個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `no-unresolved` | import先のファイルが存在することを確認 | ✅ `recommended`に含まれる |
| `named` | 名前付きimportが実際にexportされているか確認 | ✅ `recommended`に含まれる |
| `default` | デフォルトimportの存在確認 | ✅ `recommended`に含まれる |
| `namespace` | namespace importの検証 | ✅ `recommended`に含まれる |
| `no-absolute-path` | 絶対パスでのimportを禁止 | ❌ `recommended`に含まれない |
| `no-self-import` | 自分自身をimportしない | ❌ `recommended`に含まれない |
| `no-cycle` | 循環依存の検出（ヘキサゴナルアーキテクチャで重要） | ❌ `recommended`に含まれない（重要） |
| `no-useless-path-segments` | 不要な`../`等を削除 | ❌ `recommended`に含まれない |
| `no-deprecated` | 非推奨APIの使用を警告 | ❌ `recommended`に含まれない |
| `no-mutable-exports` | mutableな値のexportを禁止 | ❌ `recommended`に含まれない |
| `first` | importをファイルの最初に配置 | ❌ `recommended`に含まれない |
| `no-duplicates` | 重複importの禁止 | ❌ `recommended`に含まれない |
| `order` | import順序の統一（Effect優先、グループ分け） | ❌ `recommended`に含まれない |
| `unused-imports/*` | 未使用importの自動削除 | ❌ 別プラグイン |

**判定**:
- ✅ **14個中4個は`recommended`で対応可能**
- ❌ **10個は手動設定が必要**（特に`no-cycle`, `order`は重要）

**推奨**:
```javascript
import importXPlugin from "eslint-plugin-import-x";

{
  plugins: {
    "import-x": importXPlugin,
  },
  rules: {
    // recommendedを使用
    ...importXPlugin.configs.recommended.rules,

    // 追加で重要なルールを手動設定
    "import-x/no-cycle": ["error", { maxDepth: Infinity }],
    "import-x/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
        pathGroups: [
          { pattern: "effect", group: "external", position: "before" },
          { pattern: "@effect/**", group: "external", position: "before" },
          { pattern: "@monorepo/**", group: "internal", position: "before" },
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
}
```

---

## コード品質（SonarJS）

### 現在の設定（179-189行目）

```javascript
"sonarjs/cognitive-complexity": ["error", 15],
"sonarjs/no-duplicate-string": ["error", { threshold: 3 }],
"sonarjs/no-identical-functions": "error",
// ... など10個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `cognitive-complexity` | 関数の認知的複雑度を制限（15以下） | ✅ `recommended`に含まれる（閾値は異なる） |
| `no-duplicate-string` | 文字列の重複を検出（マジックナンバー対策） | ✅ `recommended`に含まれる |
| `no-identical-functions` | 同一の関数を検出 | ✅ `recommended`に含まれる |
| `no-collapsible-if` | ネストしたifを統合 | ✅ `recommended`に含まれる |
| `no-collection-size-mischeck` | コレクションサイズのチェックミスを検出 | ✅ `recommended`に含まれる |
| `no-duplicated-branches` | if/elseで同じ処理を検出 | ✅ `recommended`に含まれる |
| `no-identical-conditions` | 同じ条件式を検出 | ✅ `recommended`に含まれる |
| `no-redundant-boolean` | 冗長なboolean処理を検出 | ✅ `recommended`に含まれる |
| `no-unused-collection` | 使われないコレクションを検出 | ✅ `recommended`に含まれる |
| `prefer-immediate-return` | 即座にreturnできる場合を推奨 | ✅ `recommended`に含まれる |

**判定**: ✅ **10個すべて`sonarjs/recommended`で対応可能**

**推奨**:
```javascript
import sonarjsPlugin from "eslint-plugin-sonarjs";

{
  plugins: {
    sonarjs: sonarjsPlugin,
  },
  rules: {
    // recommendedを使用（すべて含まれている）
    ...sonarjsPlugin.configs.recommended.rules,

    // 閾値のカスタマイズのみ必要なら
    "sonarjs/cognitive-complexity": ["error", 15], // デフォルトは15なので不要
  },
}
```

**結論**: ✅ **SonarJSは完全に`recommended`で置き換え可能**

---

## Unicorn（モダンなベストプラクティス）

### 現在の設定（193-209行目）

```javascript
"unicorn/better-regex": "error",
"unicorn/no-null": "error",
"unicorn/no-for-loop": "error",
// ... など17個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `better-regex` | 正規表現の最適化 | ✅ `recommended`に含まれる |
| `catch-error-name` | catchした変数名を`error`に統一 | ✅ `recommended`に含まれる |
| `consistent-function-scoping` | 関数スコープの一貫性 | ✅ `recommended`に含まれる |
| `error-message` | Errorオブジェクトにメッセージ必須 | ✅ `recommended`に含まれる |
| `no-array-for-each` | `forEach`を禁止して`for-of`を推奨 | ✅ `recommended`に含まれる |
| `no-for-loop` | C言語スタイルのforループを禁止 | ✅ `recommended`に含まれる |
| `no-null` | `null`を禁止して`undefined`を推奨 | ❌ `recommended`に含まれない（議論の余地あり） |
| `no-useless-undefined` | 不要な`undefined`を削除 | ✅ `recommended`に含まれる |
| `prefer-array-some` | `find() !== undefined`より`some()`を推奨 | ✅ `recommended`に含まれる |
| `prefer-default-parameters` | デフォルトパラメータの使用推奨 | ✅ `recommended`に含まれる |
| `prefer-includes` | `indexOf() !== -1`より`includes()`を推奨 | ✅ `recommended`に含まれる |
| `prefer-node-protocol` | Node.jsのimportで`node:`プロトコルを使用 | ✅ `recommended`に含まれる |
| `prefer-optional-catch-binding` | 使わないcatch変数を省略 | ✅ `recommended`に含まれる |
| `prefer-string-starts-ends-with` | `indexOf() === 0`より`startsWith()`を推奨 | ✅ `recommended`に含まれる |
| `prefer-ternary` | if/elseよりもternary演算子を推奨 | ❌ `recommended`に含まれない |
| `throw-new-error` | `throw Error()`ではなく`throw new Error()`を強制 | ✅ `recommended`に含まれる |

**判定**:
- ✅ **17個中15個は`unicorn/recommended`で対応可能**
- ❌ **2個は手動設定が必要**（`no-null`, `prefer-ternary`）

**`no-null`について**:
- TypeScriptでは`null`と`undefined`を区別する文化がある
- Effect-TSでは`Option.none()`を使うため`null`は不要
- しかし、外部APIとの連携では`null`が必要な場合もある
- **判断**: プロジェクト方針による（Effect-TSプロジェクトなら設定推奨）

**推奨**:
```javascript
import unicornPlugin from "eslint-plugin-unicorn";

{
  plugins: {
    unicorn: unicornPlugin,
  },
  rules: {
    // recommendedを使用
    ...unicornPlugin.configs.recommended.rules,

    // Effect-TSプロジェクトでは追加
    "unicorn/no-null": "error",
    "unicorn/prefer-ternary": "error",
  },
}
```

---

## Promise

### 現在の設定（213-221行目）

```javascript
"promise/always-return": "error",
"promise/catch-or-return": "error",
"promise/prefer-await-to-then": "error",
// ... など8個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `always-return` | Promiseチェーンで必ずreturnする | ✅ `recommended`に含まれる |
| `no-return-wrap` | 不要なPromise.resolveを禁止 | ✅ `recommended`に含まれる |
| `param-names` | Promise引数名の統一（resolve, reject） | ✅ `recommended`に含まれる |
| `catch-or-return` | Promiseを必ずcatchまたはreturnする | ✅ `recommended`に含まれる |
| `no-nesting` | Promiseのネストを警告 | ❌ `recommended`に含まれない |
| `no-promise-in-callback` | コールバック内でPromiseを使わない | ❌ `recommended`に含まれない |
| `prefer-await-to-then` | `.then()`より`async/await`を推奨 | ❌ `recommended`に含まれない（重要） |
| `prefer-await-to-callbacks` | コールバックより`async/await`を推奨 | ❌ `recommended`に含まれない |

**判定**:
- ✅ **8個中4個は`promise/recommended`で対応可能**
- ❌ **4個は手動設定が必要**（特に`prefer-await-to-then`は重要）

**推奨**:
```javascript
import promisePlugin from "eslint-plugin-promise";

{
  plugins: {
    promise: promisePlugin,
  },
  rules: {
    // recommendedを使用
    ...promisePlugin.configs.recommended.rules,

    // Effect-TSプロジェクトでは追加（async/awaitよりEffect優先）
    "promise/prefer-await-to-then": "error",
    "promise/prefer-await-to-callbacks": "error",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
  },
}
```

---

## JSDoc

### 現在の設定（225-238行目）

```javascript
"jsdoc/check-access": "error",
"jsdoc/require-description": "error",
"jsdoc/require-param": "error",
// ... など13個のルール
```

### 各ルールの詳細

| ルール | 設定理由 | recommendedで対応可能か |
|--------|---------|----------------------|
| `check-access` | `@access`タグの検証 | ✅ `recommended`に含まれる |
| `check-alignment` | JSDocの整列チェック | ✅ `recommended`に含まれる |
| `check-param-names` | パラメータ名の一致チェック | ✅ `recommended`に含まれる |
| `check-property-names` | プロパティ名の検証 | ✅ `recommended`に含まれる |
| `check-tag-names` | タグ名の検証 | ✅ `recommended`に含まれる |
| `check-types` | 型の検証 | ✅ `recommended`に含まれる |
| `require-description` | 説明文を必須にする | ❌ `recommended`に含まれない（厳格すぎる） |
| `require-param` | `@param`を必須にする | ❌ `recommended`に含まれない |
| `require-param-description` | パラメータの説明を必須にする | ❌ `recommended`に含まれない |
| `require-param-type` | パラメータの型を必須にする | ❌ `recommended`に含まれない（TypeScriptなら不要） |
| `require-returns` | `@returns`を必須にする | ❌ `recommended`に含まれない |
| `require-returns-description` | 戻り値の説明を必須にする | ❌ `recommended`に含まれない |
| `require-returns-type` | 戻り値の型を必須にする | ❌ `recommended`に含まれない（TypeScriptなら不要） |

**判定**:
- ✅ **13個中6個は`jsdoc/recommended`で対応可能**
- ❌ **7個は手動設定が必要**

**TypeScriptプロジェクトでは**:
- 型情報はTypeScriptが持っているので、`require-param-type`や`require-returns-type`は不要
- `jsdoc/recommended-typescript`を使うべき

**推奨**:
```javascript
import jsdocPlugin from "eslint-plugin-jsdoc";

{
  plugins: {
    jsdoc: jsdocPlugin,
  },
  rules: {
    // TypeScript用のrecommendedを使用
    ...jsdocPlugin.configs["recommended-typescript"].rules,

    // 公開APIには説明を必須にする（内部関数は除外）
    "jsdoc/require-description": "error",
    "jsdoc/require-param-description": "error",
    "jsdoc/require-returns-description": "error",
  },
}
```

---

## Vitest（テスト）

### 現在の設定（300-307行目）

```javascript
...vitestPlugin.configs.recommended.rules,
"vitest/expect-expect": "error",
"vitest/no-disabled-tests": "warn",
// ... など7個のルール
```

**判定**: ✅ **すべて`vitest/recommended`に含まれている**

**推奨**: 現在の設定のまま（`vitest/recommended`を使用）

---

## 推奨される改善案

### 最終的な推奨設定

現在の329行の設定を、**約100行に削減**できます：

```javascript
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
      // TypeScript: strictTypeChecked + 追加ルール
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
        { selector: "default", format: ["camelCase"], leadingUnderscore: "forbid", trailingUnderscore: "forbid" },
        { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"] },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["PascalCase"] },
      ],

      // ========================================
      // 関数型プログラミング: strict推奨
      // ========================================
      ...functionalPlugin.configs.strict.rules,
      "functional/prefer-immutable-types": [
        "error",
        { enforcement: "ReadonlyDeep", ignoreInferredTypes: false },
      ],

      // ========================================
      // Import管理: recommended + 循環依存検出 + 順序
      // ========================================
      ...importXPlugin.configs.recommended.rules,
      "import-x/no-cycle": ["error", { maxDepth: Infinity }],
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [
            { pattern: "effect", group: "external", position: "before" },
            { pattern: "@effect/**", group: "external", position: "before" },
            { pattern: "@monorepo/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin", "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],

      // ========================================
      // コード品質: recommended使用
      // ========================================
      ...sonarjsPlugin.configs.recommended.rules,

      // ========================================
      // Unicorn: recommended + Effect-TS向け追加
      // ========================================
      ...unicornPlugin.configs.recommended.rules,
      "unicorn/no-null": "error", // Effect-TSではOption使用
      "unicorn/prefer-ternary": "error",

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
    files: ["packages/frontend/**/*", "packages/backend/**/*", "packages/shared/**/*"],
    rules: {
      "import-x/no-unresolved": "off",
      "functional/prefer-immutable-types": "off",
      "functional/immutable-data": "warn",
      "functional/no-let": "warn",
      "functional/no-loop-statements": "warn",
      "functional/no-throw-statements": "off",
      "jsdoc/require-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
      "@typescript-eslint/naming-convention": "off",
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
      "unicorn/no-null": "warn",
      "unused-imports/no-unused-vars": "warn",
      "@typescript-eslint/no-misused-spread": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
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
      "jsdoc/require-description": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
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
```

### 主な改善点

1. ✅ **SonarJS**: 10個の手動設定 → `recommended`で置き換え（10行削減）
2. ✅ **Unicorn**: 17個の手動設定 → `recommended` + 2個の追加（15行削減）
3. ✅ **Promise**: 8個の手動設定 → `recommended` + 4個の追加（4行削減）
4. ✅ **JSDoc**: 13個の手動設定 → `recommended-typescript` + 3個の追加（10行削減）
5. ✅ **Functional**: 7個の手動設定 → `strict`使用（推奨）
6. ✅ **TypeScript**: strictTypeCheckedで11個カバー、8個のみ手動設定
7. ✅ **Import**: recommendedで4個カバー、重要な10個のみ手動設定

### 削減効果

- **現在**: 329行
- **改善後**: 約180行（約45%削減）
- **可読性**: 大幅に向上（recommendedベース明示）
- **保守性**: プラグイン更新時のメンテナンスが容易

---

## まとめ

### recommendedで対応可能な割合

| プラグイン | 手動設定数 | recommendedで対応可能 | 手動設定必要 | 対応率 |
|-----------|-----------|---------------------|------------|-------|
| TypeScript | 19 | 11 | 8 | 58% |
| Functional | 7 | 0 (strictで7) | 0 | 100% (strict使用) |
| Import | 14 | 4 | 10 | 29% |
| SonarJS | 10 | 10 | 0 | 100% |
| Unicorn | 17 | 15 | 2 | 88% |
| Promise | 8 | 4 | 4 | 50% |
| JSDoc | 13 | 6 | 7 | 46% |
| Vitest | 7 | 7 | 0 | 100% |
| **合計** | **95** | **57 (60%)** | **31** | **63%** |

### 重要な手動設定（削除不可）

以下の31個のルールは`recommended`に含まれないため、手動設定が必要です：

**TypeScript（8個）**:
- `explicit-function-return-type`
- `explicit-module-boundary-types`
- `switch-exhaustiveness-check`
- `consistent-type-imports`
- `consistent-type-exports`
- `naming-convention`

**Import（10個）**:
- `no-cycle` ★最重要（循環依存検出）
- `order` ★最重要（import順序統一）
- `no-absolute-path`
- `no-self-import`
- `no-useless-path-segments`
- `no-deprecated`
- `no-mutable-exports`
- `first`
- `no-duplicates`
- `unused-imports/*`（別プラグイン）

**Unicorn（2個）**:
- `no-null`（Effect-TSプロジェクト向け）
- `prefer-ternary`

**Promise（4個）**:
- `prefer-await-to-then` ★重要（async/await推奨）
- `prefer-await-to-callbacks`
- `no-nesting`
- `no-promise-in-callback`

**JSDoc（7個）**:
- `require-description`（公開API用）
- `require-param-description`
- `require-returns-description`

### 推奨アクション

✅ **今すぐ実施可能な改善**:
1. SonarJSの10個のルールを`recommended`に置き換え
2. Unicornの17個のルールを`recommended` + 2個に削減
3. Promiseの8個のルールを`recommended` + 4個に削減
4. JSDocを`recommended-typescript`ベースに変更

✅ **検討すべき改善**:
1. Functionalプラグインを`strict` presetに変更
2. 設定ファイルを整理してコメントを充実させる
3. パッケージごとに異なる厳格度を設定（toggl-client/notion-clientは厳格、frontend/backendは緩和）
