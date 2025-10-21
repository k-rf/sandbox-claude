# サンプルコード集

Claude Codeで試せる様々な操作のサンプルです。

## ファイル操作

### 読み取り

```
"Read the main frontend App component"
→ packages/frontend/src/App.tsx を読む

"Show me the backend API routes"
→ packages/backend/src/routes/ のファイルを確認

"Read the shared utilities"
→ packages/shared/src/utils/ のファイルを読む
```

### 編集

```
"Add a new button to the Counter component"
→ Counter.tsx にボタンを追加

"Update the API endpoint to return more data"
→ backend のルートファイルを編集

"Add a new validation function to the shared package"
→ shared/src/utils/validators.ts に関数を追加
```

### 作成

```
"Create a new Login component in the frontend"
→ 新しいコンポーネントファイルを作成

"Add a new API endpoint for posts"
→ backend に新しいルートファイルを作成
```

## コード検索

### Glob（ファイル検索）

```
"Find all TypeScript files"
→ **/*.ts

"Find all React components"
→ packages/frontend/src/components/**/*.tsx

"Find all Python files"
→ packages/cli-tool/**/*.py
```

### Grep（コード検索）

```
"Search for all TODO comments"
→ pattern: TODO

"Find where the User type is defined"
→ pattern: interface User

"Find all API endpoints"
→ pattern: Router\\.get
```

## Git操作

### コミット

```
"Commit these changes with message 'Add new feature'"
→ git add . && git commit

"Review the changes before committing"
→ git status && git diff
```

### プッシュ

```
"Push the changes to the remote"
→ git push -u origin <branch>
```

## 開発タスク

### 新機能の追加

```
"Add a search feature to the user list"
1. フロントエンドに検索入力を追加
2. バックエンドに検索APIを追加
3. 共有パッケージに検索ユーティリティを追加
```

### バグ修正

```
"Fix the error in the API request"
1. エラーログを確認
2. 関連コードを読む
3. 修正を適用
4. テスト
```

### リファクタリング

```
"Extract the data fetching logic to a custom hook"
1. useFetch フックを作成
2. コンポーネントで使用
3. 重複コードを削除
```

## テストとビルド

### テスト実行

```
"Run all tests"
→ npm run test:all

"Test the frontend"
→ cd packages/frontend && npm test
```

### ビルド

```
"Build all packages"
→ npm run build:all

"Build only the backend"
→ cd packages/backend && npm run build
```

## デバッグ

### エラー調査

```
"Why is the API request failing?"
1. ブラウザのコンソールを確認
2. ネットワークタブを確認
3. バックエンドのログを確認
4. CORSやポートの問題を確認
```

### 型エラー

```
"Fix TypeScript errors in the frontend"
1. tsc --noEmit で型チェック
2. エラーメッセージを確認
3. 型定義を修正
```

## Python CLI

### CLI開発

```
"Add a new command to fetch posts"
1. src/main.py に新しいコマンド関数を追加
2. @cli.command() デコレータを使用
3. APIリクエストロジックを実装
```

### テスト

```
"Test the CLI tool"
→ cd packages/cli-tool
→ python -m src.main --help
→ python -m src.main health
```

## ドキュメント

### 更新

```
"Update the API documentation with the new endpoint"
→ docs/API.md を編集

"Add examples to the development guide"
→ docs/DEVELOPMENT.md を編集
```

## モノレポ管理

### パッケージ追加

```
"Add a new package for database utilities"
1. packages/database ディレクトリを作成
2. package.json を作成
3. ルートの package.json のworkspacesに追加
```

### 依存関係管理

```
"Install axios in the frontend package"
→ npm install axios --workspace=packages/frontend

"Update all dependencies"
→ npm update --workspaces
```

## 高度な操作

### 複数ファイルの一括編集

```
"Rename all instances of 'getData' to 'fetchData'"
1. Grepで全ファイルを検索
2. 各ファイルを編集
3. インポート文も更新
```

### アーキテクチャ変更

```
"Move the validation logic from backend to shared package"
1. shared package に移動
2. backend と frontend で import を更新
3. テストを実行
```

### パフォーマンス最適化

```
"Optimize the React components for better performance"
1. React.memo を追加
2. useCallback を使用
3. 不要な再レンダリングを削除
```

## ベストプラクティス

1. **段階的なアプローチ**: 大きなタスクを小さなステップに分割
2. **テスト駆動**: 変更後は必ずテストを実行
3. **ドキュメント更新**: コードと同時にドキュメントも更新
4. **コミット頻度**: 小さな変更を頻繁にコミット
5. **エラーハンドリング**: 適切なエラー処理を実装

## Claude Codeの強み

- **コンテキスト理解**: プロジェクト全体を理解して作業
- **多言語サポート**: TypeScript、Python、JSON、Markdownなど
- **自動化**: 繰り返しタスクの自動化
- **検索能力**: 高速なコード検索
- **一貫性**: コーディング規約に従った実装
