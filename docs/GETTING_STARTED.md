# はじめに

Claude Code デモ・モノレポへようこそ！

## 概要

このモノレポは、Claude Codeの様々な機能を試すために設計されています。
複数の技術スタック（TypeScript、Python）と複数のパッケージを含んでいます。

## クイックスタート

### 1. 依存関係のインストール

```bash
# ルートでnpm installを実行すると、全ワークスペースの依存関係がインストールされます
npm install

# 共有パッケージのビルド（必須）
cd packages/shared
npm run build
cd ../..
```

### 2. 開発サーバーの起動

**ターミナル1: バックエンド**
```bash
npm run dev:backend
# または
cd packages/backend
npm run dev
```

**ターミナル2: フロントエンド**
```bash
npm run dev:frontend
# または
cd packages/frontend
npm run dev
```

### 3. ブラウザでアクセス

フロントエンド: http://localhost:3000

## Pythonツールの使用

```bash
cd packages/cli-tool

# 仮想環境の作成（初回のみ）
python -m venv venv

# 仮想環境の有効化
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# CLIツールの実行
python -m src.main --help
python -m src.main health
python -m src.main users
```

## パッケージ構成

### Frontend (React + TypeScript)
- **場所**: `packages/frontend`
- **ポート**: 3000
- **技術**: Vite, React, TypeScript
- **機能**: カウンター、TODOリスト、API連携デモ

### Backend (Node.js + Express)
- **場所**: `packages/backend`
- **ポート**: 4000
- **技術**: Express, TypeScript
- **機能**: REST API、ユーザーデータ、統計情報

### Shared (TypeScript Library)
- **場所**: `packages/shared`
- **用途**: 型定義、ユーティリティ関数
- **機能**: バリデーション、フォーマット、共通型

### CLI Tool (Python)
- **場所**: `packages/cli-tool`
- **技術**: Python, Click, Requests
- **機能**: APIデータ取得、ユーザー情報表示

## Claude Codeで試せること

1. **ファイル操作**
   - `Read`: ファイルを読む
   - `Write`: 新規ファイルを作成
   - `Edit`: 既存ファイルを編集

2. **コード検索**
   - `Grep`: コードを検索
   - `Glob`: ファイルをパターンで検索

3. **Git操作**
   - コミット作成
   - ブランチ管理
   - プッシュ

4. **複数言語サポート**
   - TypeScript
   - Python
   - JSON
   - Markdown

5. **タスク管理**
   - TodoWrite でタスク追跡

## トラブルシューティング

### ポートが使用中
- フロントエンド: `vite.config.ts` でポート変更
- バックエンド: `src/index.ts` でポート変更

### 依存関係のエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules packages/*/node_modules
npm install
```

### Pythonの依存関係エラー
```bash
cd packages/cli-tool
pip install --upgrade pip
pip install -r requirements.txt
```

## 次のステップ

- [API仕様](./API.md)
- [アーキテクチャ](./ARCHITECTURE.md)
- [開発ガイド](./DEVELOPMENT.md)
