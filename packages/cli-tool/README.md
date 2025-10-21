# CLI Tool

モノレポのバックエンドAPIと連携するPython製CLIツールです。

## セットアップ

```bash
# 仮想環境の作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# または開発モードでインストール
pip install -e .
```

## 使い方

```bash
# ヘルプの表示
python -m src.main --help

# データ取得
python -m src.main fetch

# ユーザー一覧
python -m src.main users

# 統計情報
python -m src.main stats
```

## 機能

- バックエンドAPIからデータを取得
- ユーザー情報の表示
- 統計情報の表示
- JSON出力のフォーマット
