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
# 依存関係のインストール
npm install

# フロントエンドの開発サーバー起動
npm run dev:frontend

# バックエンドの開発サーバー起動
npm run dev:backend

# すべてのパッケージをビルド
npm run build:all

# すべてのテストを実行
npm run test:all
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
