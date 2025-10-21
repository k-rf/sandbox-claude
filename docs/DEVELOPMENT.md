# 開発ガイド

## 開発環境のセットアップ

### 必要なツール

- Node.js 18以上
- npm 9以上
- Python 3.8以上
- Git

### 初回セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd sandbox-claude

# 依存関係のインストール
npm install

# 共有パッケージのビルド
cd packages/shared
npm run build
cd ../..
```

## 開発ワークフロー

### 1. 機能開発

```bash
# 新しいブランチを作成
git checkout -b feature/new-feature

# コードを編集
# Claude Codeを使って効率的に開発

# 変更をコミット
git add .
git commit -m "Add new feature"
```

### 2. テスト

```bash
# すべてのテストを実行
npm run test:all

# 個別パッケージのテスト
cd packages/frontend
npm test
```

### 3. ビルド

```bash
# すべてのパッケージをビルド
npm run build:all

# 個別パッケージのビルド
cd packages/backend
npm run build
```

## パッケージごとの開発

### Frontend開発

```bash
cd packages/frontend

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

**新しいコンポーネントの追加:**

1. `src/components/` に `.tsx` ファイルを作成
2. 対応する `.css` ファイルを作成
3. `App.tsx` にルートを追加

### Backend開発

```bash
cd packages/backend

# 開発サーバー起動（ホットリロード）
npm run dev

# ビルド
npm run build

# 本番モード起動
npm start
```

**新しいエンドポイントの追加:**

1. `src/routes/` に新しいルーターファイルを作成
2. `src/index.ts` でルーターをインポート・使用
3. APIドキュメントを更新

### Shared開発

```bash
cd packages/shared

# 開発モード（ウォッチモード）
npm run dev

# ビルド
npm run build
```

**新しいユーティリティの追加:**

1. `src/utils/` に関数を追加
2. `src/utils/index.ts` でエクスポート
3. 型定義を `src/types/` に追加

### CLI Tool開発

```bash
cd packages/cli-tool

# 仮想環境の有効化
source venv/bin/activate

# 開発モードでインストール
pip install -e .

# 実行
monorepo-cli --help
```

**新しいコマンドの追加:**

1. `src/main.py` に `@cli.command()` デコレータ付き関数を追加
2. コマンドのロジックを実装
3. README.mdを更新

## コーディング規約

### TypeScript

- ESLintに従う
- strictモードを有効化
- 明示的な型定義を使用
- 関数にJSDocコメントを追加

```typescript
/**
 * ユーザー情報を取得
 * @param userId - ユーザーID
 * @returns ユーザー情報
 */
function getUser(userId: number): User {
  // ...
}
```

### Python

- PEP 8に従う
- 型ヒントを使用
- Docstringを追加

```python
def fetch_api(endpoint: str) -> Optional[dict]:
    """APIからデータを取得

    Args:
        endpoint: APIエンドポイント

    Returns:
        取得したデータ、エラー時はNone
    """
    # ...
```

### Git コミット

コミットメッセージの形式:

```
<type>: <subject>

<body>
```

Types:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット
- `refactor`: リファクタリング
- `test`: テスト追加
- `chore`: その他

例:
```
feat: Add user search functionality

- Add search input component
- Implement API endpoint for user search
- Update documentation
```

## Claude Codeの活用

### ファイル操作

```
# ファイルを読む
"Read packages/frontend/src/App.tsx"

# ファイルを編集
"Edit the Counter component to add a step size"

# 新しいファイルを作成
"Create a new component UserProfile"
```

### コード検索

```
# パターンでファイル検索
"Find all TypeScript files in frontend"

# コード検索
"Search for all TODO comments"
"Find where the User type is defined"
```

### リファクタリング

```
"Refactor the data fetching logic to use a custom hook"
"Extract the validation logic to the shared package"
```

### デバッグ

```
"Find why the API request is failing"
"Check the TypeScript errors in the backend"
```

## トラブルシューティング

### TypeScriptエラー

```bash
# 型チェック
npx tsc --noEmit

# 共有パッケージを再ビルド
cd packages/shared && npm run build
```

### ポート競合

```bash
# プロセスを確認
lsof -i :3000
lsof -i :4000

# プロセスを終了
kill -9 <PID>
```

### npm依存関係の問題

```bash
# キャッシュクリア
npm cache clean --force

# 再インストール
rm -rf node_modules package-lock.json
npm install
```

## パフォーマンス最適化

### Frontend

- React.memoでコンポーネントをメモ化
- useCallbackでコールバックをメモ化
- 画像の最適化
- コード分割

### Backend

- レスポンスの圧縮
- キャッシング
- データベースクエリの最適化
- 接続プーリング

## デプロイ

### Frontend

```bash
# ビルド
npm run build

# distディレクトリをデプロイ
# Vercel, Netlify, などにデプロイ可能
```

### Backend

```bash
# ビルド
npm run build

# distディレクトリと依存関係をデプロイ
# Heroku, AWS, などにデプロイ可能
```

### Docker（今後の拡張）

```dockerfile
# Dockerfileの例
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```
