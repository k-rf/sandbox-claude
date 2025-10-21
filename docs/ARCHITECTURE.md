# アーキテクチャ

## システム構成図

```
┌─────────────────────────────────────────┐
│         Claude Code デモ・モノレポ         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐         ┌──────────┐    │
│  │ Frontend │◄────────┤ Backend  │    │
│  │  (React) │  HTTP   │ (Express)│    │
│  └────┬─────┘         └────┬─────┘    │
│       │                    │          │
│       │  ┌────────────┐    │          │
│       └──┤   Shared   ├────┘          │
│          │ (TypeScript)                │
│          └────────────┘                │
│                                         │
│  ┌──────────┐         ┌──────────┐    │
│  │   Docs   │         │ CLI Tool │    │
│  │ (Markdown)│         │ (Python) │    │
│  └──────────┘         └────┬─────┘    │
│                            │          │
│                            ▼          │
│                       [Backend API]   │
└─────────────────────────────────────────┘
```

## パッケージの依存関係

```
frontend ──┐
           ├──► shared
backend ───┘

cli-tool ──► backend (HTTP)
```

## ディレクトリ構造

```
.
├── packages/
│   ├── frontend/           # React + TypeScript
│   │   ├── src/
│   │   │   ├── components/ # Reactコンポーネント
│   │   │   ├── hooks/      # カスタムフック
│   │   │   └── utils/      # ユーティリティ
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── backend/            # Node.js + Express
│   │   ├── src/
│   │   │   ├── routes/     # APIルート
│   │   │   ├── middleware/ # ミドルウェア
│   │   │   ├── utils/      # ユーティリティ
│   │   │   └── index.ts    # エントリーポイント
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/             # 共有ライブラリ
│   │   ├── src/
│   │   │   ├── types/      # 型定義
│   │   │   └── utils/      # ユーティリティ関数
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli-tool/           # Python CLI
│       ├── src/
│       │   └── main.py
│       ├── setup.py
│       └── requirements.txt
│
├── docs/                   # ドキュメント
│   ├── GETTING_STARTED.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
│
├── package.json            # ルートpackage.json
├── .gitignore
└── README.md
```

## 技術スタック

### Frontend
- **フレームワーク**: React 18
- **ビルドツール**: Vite 5
- **言語**: TypeScript 5
- **ルーティング**: React Router 6
- **スタイリング**: CSS Modules

### Backend
- **フレームワーク**: Express 4
- **言語**: TypeScript 5
- **ランタイム**: Node.js
- **開発ツール**: tsx (TypeScript実行)

### Shared
- **言語**: TypeScript 5
- **ビルド**: tsc (TypeScriptコンパイラ)

### CLI Tool
- **言語**: Python 3.8+
- **CLI**: Click
- **HTTP**: Requests

## データフロー

### フロントエンド → バックエンド

1. ユーザーがブラウザで操作
2. ReactコンポーネントがfetchでAPIリクエスト
3. Viteの開発サーバーがプロキシ（`/api`）
4. ExpressがリクエストをルーティングIDにマッピング
5. レスポンスをJSONで返却
6. Reactがレスポンスを表示

### CLI Tool → バックエンド

1. Pythonスクリプト実行
2. Requestsライブラリでhttp://localhost:4000/apiにリクエスト
3. ExpressがJSONレスポンス
4. Pythonが整形して出力

## セキュリティ

現在のデモ環境では以下のセキュリティ機能が実装されています：

- CORS設定
- エラーハンドリング
- 入力バリデーション（共有パッケージ）

本番環境では追加で以下が必要：
- 認証・認可
- レート制限
- HTTPS
- CSRFトークン
- セキュリティヘッダー

## スケーラビリティ

このアーキテクチャは以下のように拡張可能：

1. **データベースの追加**: Backend にDB接続を追加
2. **認証の追加**: 認証ミドルウェアを追加
3. **新しいパッケージ**: `packages/` に追加
4. **マイクロサービス化**: Backendを複数サービスに分割
5. **デプロイ**: Docker化、CI/CD追加
