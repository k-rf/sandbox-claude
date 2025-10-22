# AGENT.md - Claude Code開発ガイドライン

このファイルは、Claude CodeがこのToggl-Notion連携プロジェクトで作業する際のルールとガイドラインを定義します。

## プロジェクト概要

### 目的
Togglを生活の中心として使用するユーザーのために、TogglエントリをNotionのデイリーノートに自動同期し、Togglを柔軟に操作できるツール群を提供する。

### コアコンセプト
- **Toggl中心**: すべての時間追跡はTogglで行う
- **Notion連携**: デイリーノートに自動反映
- **再利用可能**: Toggl操作のアセットを汎用的に設計
- **型安全**: TypeScriptで型安全な実装
- **拡張性**: 新しい機能を簡単に追加できる設計

## アーキテクチャ原則

### パッケージ構成
```
packages/
├── toggl-client/       # Toggl APIラッパー（型安全、再利用可能）
├── notion-client/      # Notion APIラッパー（型安全、再利用可能）
├── toggl-notion-sync/  # 同期ロジック（toggl-client, notion-clientを使用）
├── toggl-cli/          # Toggl操作用CLIツール（toggl-clientを使用）
├── shared/             # 共通ユーティリティと型定義
├── frontend/           # Webダッシュボード（将来的に）
└── backend/            # API・Webhook受信サーバー（将来的に）
```

### 依存関係のルール
1. **クライアントパッケージは独立**: `toggl-client`と`notion-client`は相互依存しない
2. **shared依存は許可**: すべてのパッケージは`shared`に依存できる
3. **上位層のみ統合**: 同期ロジックは`toggl-notion-sync`で実装
4. **循環依存の禁止**: パッケージ間の循環依存は絶対に作らない

## コーディング規約

### TypeScript
- **strictモード必須**: すべてのパッケージで`strict: true`
- **明示的な型定義**: 関数の戻り値、パラメータは明示的に型を指定
- **any禁止**: `any`の使用は原則禁止、`unknown`を使用
- **型ガード**: 外部API応答には型ガードを実装
- **JSDoc**: 公開APIには必ずJSDocコメントを付ける

```typescript
/**
 * Togglのタイムエントリを取得
 * @param startDate - 開始日（ISO 8601形式）
 * @param endDate - 終了日（ISO 8601形式）
 * @returns タイムエントリの配列
 */
export async function getTimeEntries(
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  // ...
}
```

### エラーハンドリング
- **カスタムエラークラス**: APIエラー用のカスタムエラーを定義
- **エラーの伝播**: エラーは適切にラップして上位に伝える
- **ログ**: エラー発生時は必ずログを出力

```typescript
export class TogglApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'TogglApiError';
  }
}
```

### API設計

#### Toggl Client
- **認証**: API Tokenベースの認証
- **レート制限**: レート制限を考慮した実装（リトライロジック）
- **型定義**: Toggl APIのレスポンスを完全に型定義
- **モジュール分割**: エンティティごとにモジュール分割（entries, projects, tags, etc.）

#### Notion Client
- **認証**: Integration Tokenベースの認証
- **ページ操作**: デイリーノートの作成・更新に特化
- **ブロック構築**: ブロックビルダーパターンを使用
- **型定義**: Notionの複雑なブロック構造を型安全に

### 環境変数管理
- **必須変数の検証**: 起動時に必須環境変数をチェック
- **.env.example**: すべての環境変数を記載
- **型安全**: 環境変数アクセスは型安全なヘルパー経由

```typescript
// shared/src/config.ts
export const config = {
  toggl: {
    apiToken: requireEnv('TOGGL_API_TOKEN'),
    workspaceId: requireEnv('TOGGL_WORKSPACE_ID'),
  },
  notion: {
    apiToken: requireEnv('NOTION_API_TOKEN'),
    databaseId: requireEnv('NOTION_DAILY_NOTES_DATABASE_ID'),
  },
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}
```

## テスト方針

### 単体テスト
- **カバレッジ目標**: 80%以上
- **モック**: 外部APIはモック化
- **テストツール**: Vitest

### 統合テスト
- **環境**: テスト用のToggl/Notionワークスペースを使用
- **クリーンアップ**: テスト後は必ずデータをクリーンアップ

## ドキュメント要件

### README.md（各パッケージ）
1. パッケージの目的
2. インストール方法
3. 使用例
4. API仕様（公開関数）
5. 設定方法

### コード内コメント
- 複雑なロジックには説明コメント
- なぜその実装なのかを記述（Whatではなく、Why）

## セキュリティ

### APIキー管理
- **環境変数のみ**: APIキーは環境変数からのみ取得
- **コミット禁止**: `.env`ファイルはgitignore
- **ログ禁止**: APIキーをログに出力しない

### データ保護
- **最小権限**: Notion/TogglのIntegrationは必要最小限の権限
- **個人情報**: タイムエントリの説明文など、個人情報を含む可能性のあるデータの扱いに注意

## Git運用

### コミットメッセージ
```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト
- `chore`: その他

**Scopes:**
- `toggl-client`
- `notion-client`
- `sync`
- `cli`
- `shared`

### ブランチ戦略
- `main`: 安定版
- `claude/*`: Claude Codeの作業ブランチ
- `feature/*`: 新機能開発
- `fix/*`: バグ修正

## 優先事項

### フェーズ1: 基礎構築
1. ✅ モノレポ環境構築
2. 🔄 `toggl-client` パッケージ作成
3. 🔄 `notion-client` パッケージ作成
4. 共通型定義（`shared`に追加）

### フェーズ2: 同期機能
1. デイリーノートフォーマット設計
2. 同期ロジック実装（`toggl-notion-sync`）
3. スケジュール実行機能
4. エラーハンドリングと再試行

### フェーズ3: CLIツール
1. Toggl操作コマンド（start, stop, list, etc.）
2. 設定管理
3. インタラクティブモード

### フェーズ4: 拡張機能
1. Webダッシュボード
2. Webhook対応
3. カスタムレポート
4. 他サービス連携

## Claude Codeへの指示

### 実装時の注意
1. **段階的実装**: 一度に大きな機能を作らず、小さく分割して実装
2. **テスト優先**: 新しい機能には必ずテストを追加
3. **ドキュメント同期**: コード変更時はドキュメントも更新
4. **型安全第一**: 型エラーは絶対に放置しない
5. **エラーハンドリング**: すべての外部API呼び出しはエラーハンドリング

### 質問すべき状況
- API設計に複数の選択肢がある場合
- ユーザーの使用パターンに関わる実装判断
- セキュリティに関わる実装
- デイリーノートのフォーマット

### 避けるべきこと
- APIキーのハードコード
- `any`型の使用
- テストなしの実装
- ドキュメントなしの公開API
- 循環依存の作成

## 参考リソース

### API仕様
- Toggl Track API: https://developers.track.toggl.com/docs/
- Notion API: https://developers.notion.com/

### ライブラリ候補
- HTTP Client: `axios` or `node-fetch`
- 日付処理: `date-fns`
- バリデーション: `zod`
- CLI: `commander` or `yargs`（Python CLI は `click`）

---

**最終更新**: 2025-10-22
**バージョン**: 1.0.0
