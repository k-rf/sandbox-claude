# Claude Code デモ・モノレポ

Claude Codeの様々な機能を試すためのモノレポ環境です。

## 構造

```
.
├── packages/
│   ├── frontend/      # React + TypeScript フロントエンドアプリ
│   ├── backend/       # Node.js + Express バックエンドAPI
│   ├── shared/        # 共有TypeScriptライブラリ
│   └── cli-tool/      # Python CLIツール
├── docs/              # ドキュメント
└── README.md
```

## セットアップ

```bash
# 依存関係のインストール（Git hooksも自動セットアップ）
npm install

# フロントエンドの開発サーバー起動
npm run dev:frontend

# バックエンドの開発サーバー起動
npm run dev:backend

# すべてのパッケージをビルド
npm run build:all

# すべてのテストを実行
npm run test:all

# コード品質チェック
npm run lint        # リント（高速 + 厳格）
npm run format      # フォーマット
npm run check       # 完全チェック
```

## パッケージ詳細

### Frontend (React + TypeScript)
- Vite + React + TypeScript
- 状態管理とルーティング
- 共有パッケージを使用

### Backend (Node.js + Express)
- REST API
- TypeScript対応
- 共有パッケージを使用

### Shared (TypeScript Library)
- 共通の型定義
- ユーティリティ関数
- バリデーション

### CLI Tool (Python)
- コマンドラインツール
- データ処理機能
- API連携

## コード品質

### 最先端のツールチェーン

- **Oxlint**: 超高速Linter（ESLintの50-100倍高速）
- **Oxfmt**: 超高速Formatter（Prettierの45倍高速、99%互換）
- **ESLint**: 厳格な型チェック（Effect-TS、関数型プログラミング強制）
- **Lefthook**: Git Hooks（コミット時自動チェック）

### Git Hooks（自動実行）

コミット時に自動的に以下が実行されます：

- ✅ Lintチェック＆自動修正
- ✅ フォーマット自動修正
- ✅ Conventional Commits形式検証

プッシュ時には完全チェック（lint + format + test）が実行されます。

詳細は [docs/LINTING_AND_FORMATTING.md](./docs/LINTING_AND_FORMATTING.md) を参照。

## Claude Codeで試せる機能

1. **ファイル操作**: Read, Write, Edit
2. **コード検索**: Grep, Glob
3. **Git操作**: コミット、プッシュ、ブランチ管理
4. **複数言語サポート**: TypeScript, Python, JSON, Markdown
5. **モノレポ管理**: ワークスペース操作
6. **タスク管理**: TodoWrite
7. **Web検索**: WebSearch, WebFetch
8. **Shell操作**: Bash

## ライセンス

MIT
