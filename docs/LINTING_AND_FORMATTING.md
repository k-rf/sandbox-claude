# Linting & Formatting ガイド

このプロジェクトでは、最先端のツールチェーンを使用して厳格なコード品質を維持します。

## ツール構成

### 🚀 Oxc系（超高速）

- **Oxlint**: Rust製Linter（ESLintの50-100倍高速）
- **Oxfmt**: Rust製Formatter（Prettierの45倍高速、99%互換）

### 📋 ESLint（厳格な型チェック）

- TypeScript strict-type-checked
- Effect-TS専用ルール
- 関数型プログラミング強制
- Import/Export管理
- コード品質チェック

---

## コマンド一覧

### 開発時

```bash
# 高速チェック（Oxlint）
npm run lint:fast

# 厳格チェック（ESLint）
npm run lint:strict

# 両方実行
npm run lint

# 自動修正
npm run lint:fix

# フォーマット
npm run format

# フォーマットチェックのみ
npm run format:check

# 完全チェック（lint + format）
npm run check
```

### CI/CD

```bash
# すべてのパッケージでチェック
npm run lint:all

# すべてのパッケージでフォーマットチェック
npm run format:check
```

---

## 設定ファイル

### eslint.config.js

ESLint Flat Config形式の設定ファイル。

**厳格ルール:**
- `strict-type-checked`: TypeScript最強の型チェック
- `no-explicit-any`: any型禁止
- `explicit-function-return-type`: 戻り値型必須
- `functional/*`: 関数型プログラミング強制（let禁止、immutable推奨）
- `import-x/*`: 循環依存検出、順序強制
- `jsdoc/*`: JSDoc必須（テストファイル除く）

### .oxlintrc.json

Oxlint設定ファイル。

**全カテゴリ有効:**
- `typescript: all`
- `correctness: all`
- `suspicious: all`
- `perf: all`
- `style: all`
- Import plugin有効

### oxfmt.json

Oxfmt設定ファイル（Prettier 99%互換）。

**スタイル:**
- インデント: スペース2
- 行幅: 100
- セミコロン: 常に付ける
- クォート: シングル
- 末尾カンマ: 常に付ける
- アロー関数の括弧: 常に付ける

---

## エディタ統合

### VSCode

推奨拡張機能（`.vscode/extensions.json`）:
- ESLint
- Prettier
- TypeScript Next
- Vitest Explorer

設定（`.vscode/settings.json`）:
- 保存時にESLint自動修正
- Flat Config使用
- TypeScriptワークスペース版使用

### その他のエディタ

1. **ESLint**: Flat Config対応のプラグインをインストール
2. **Oxlint**: エディタプラグインが利用可能な場合は使用
3. **Oxfmt**: エディタプラグインが利用可能な場合は使用

---

## ルール詳細

### TypeScript厳格ルール

```typescript
// ❌ NG: 戻り値型なし
function add(a: number, b: number) {
  return a + b;
}

// ✅ OK: 戻り値型必須
function add(a: number, b: number): number {
  return a + b;
}

// ❌ NG: any型
function process(data: any): void {
  // ...
}

// ✅ OK: 適切な型定義
function process(data: UserData): void {
  // ...
}
```

### 関数型プログラミング

```typescript
// ❌ NG: let使用
let count = 0;
count++;

// ✅ OK: const使用
const count = 0;
const nextCount = count + 1;

// ❌ NG: 配列のミューテーション
const array = [1, 2, 3];
array.push(4);

// ✅ OK: 新しい配列を作成
const array = [1, 2, 3];
const newArray = [...array, 4];

// ❌ NG: forループ
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}

// ✅ OK: 関数型メソッド
array.forEach((item) => console.log(item));
```

### Import順序

```typescript
// 自動的に以下の順序で整理されます:

// 1. Node.js builtin
import fs from 'node:fs';

// 2. Effect-TS（優先）
import { Effect } from 'effect';
import { Layer } from '@effect/platform';

// 3. 外部パッケージ
import React from 'react';
import axios from 'axios';

// 4. 内部パッケージ
import { TimeEntry } from '@monorepo/shared';

// 5. 親ディレクトリ
import { useAuth } from '../hooks/useAuth';

// 6. 同階層
import { Button } from './Button';
```

### JSDoc必須

```typescript
// ❌ NG: JSDocなし
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ OK: JSDoc必須
/**
 * アイテムの合計金額を計算
 * @param items - 計算対象のアイテム配列
 * @returns 合計金額
 */
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## トラブルシューティング

### ESLintエラーが多すぎる

厳格な設定なので、最初は多数のエラーが出ることがあります。

**対処法:**
1. `npm run lint:fix` で自動修正
2. 残ったエラーは手動で修正
3. どうしても対応できない場合は、一時的に該当ルールを無効化（要相談）

### Oxlintとの競合

OxlintとESLintで同じルールがある場合、ESLint側を優先します。

### パフォーマンス

開発時は `npm run lint:fast`（Oxlint）のみ実行すると高速です。
CI/CDでは `npm run check`（完全チェック）を実行します。

---

## CI/CD統合

### GitHub Actions例

```yaml
name: Lint and Format

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
```

---

## 参考リソース

- [Oxc Documentation](https://oxc.rs/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Effect-TS](https://effect.website/)
- [eslint-plugin-functional](https://github.com/eslint-functional/eslint-plugin-functional)
