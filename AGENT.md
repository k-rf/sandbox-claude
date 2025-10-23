# AGENT.md - Claude Code開発ガイドライン

このファイルは、Claude CodeがこのToggl-Notion連携プロジェクトで作業する際のルールとガイドラインを定義します。

## プロジェクト概要

### 目的
TogglエントリをNotionのデイリーノートに自動同期し、Togglを柔軟に操作できる再利用可能なツール群を提供する。

### コアコンセプト
- **関数型ドメイン駆動設計**: Effect-TSを活用した型安全で副作用を明示的に扱う設計
- **ポートアンドアダプター**: ドメインロジックを外部システムから独立させる
- **依存関係の制御**: 依存性逆転の原則を厳格に適用
- **型安全**: TypeScriptとEffect-TSで完全な型安全性
- **再利用可能**: モジュラーで拡張性の高いアセット設計

## アーキテクチャ原則

### ポートアンドアダプターアーキテクチャ（ヘキサゴナルアーキテクチャ）

各パッケージは以下の層構造を持つ：

```
src/
├── domain/           # ドメイン層（ビジネスロジック、エンティティ）
│   ├── models/       # ドメインモデル（純粋な型定義）
│   ├── services/     # ドメインサービス（ビジネスロジック）
│   └── errors/       # ドメインエラー
├── application/      # アプリケーション層（ユースケース）
│   ├── usecases/     # ユースケース実装
│   └── ports/        # ポート（インターフェース定義）
├── infrastructure/   # インフラ層（外部システム適合）
│   ├── adapters/     # アダプター（ポートの実装）
│   └── http/         # HTTP通信
└── index.ts          # エクスポート
```

### 依存関係の方向（厳守）

```
infrastructure → application → domain
       ↓              ↓
    adapters       ports
```

**絶対ルール:**
1. **Domain層**: 他の層に依存しない（純粋なビジネスロジック）
2. **Application層**: Domainのみに依存（Infrastructureに依存しない）
3. **Infrastructure層**: ApplicationとDomainに依存可能
4. **依存性逆転**: ApplicationはPort（インターフェース）を定義し、InfrastructureがAdapterで実装

### パッケージ構成

```
packages/
├── toggl-client/       # Toggl操作ライブラリ
│   ├── domain/         # Togglのドメインモデル（TimeEntry, Project, Tag等）
│   ├── application/    # ユースケースとポート定義
│   └── infrastructure/ # Toggl API アダプター
│
├── notion-client/      # Notion操作ライブラリ
│   ├── domain/         # Notionのドメインモデル（Page, Block, Database等）
│   ├── application/    # ユースケースとポート定義
│   └── infrastructure/ # Notion API アダプター
│
├── toggl-notion-sync/  # 同期アプリケーション
│   ├── domain/         # 同期のドメインロジック
│   ├── application/    # 同期ユースケース
│   └── infrastructure/ # toggl-client/notion-client統合
│
├── toggl-cli/          # CLIツール（TypeScript版）
│   └── commands/       # CLIコマンド実装
│
├── shared/             # 共通ユーティリティ
│   ├── config/         # 設定管理（Effect Config）
│   ├── logger/         # ロギング（Effect Logger）
│   └── types/          # 共通型定義
│
├── frontend/           # Webダッシュボード（将来）
└── backend/            # API・Webhookサーバー（将来）
```

### パッケージ間の依存関係ルール
1. **クライアントパッケージは独立**: `toggl-client`と`notion-client`は相互依存しない
2. **shared依存は許可**: すべてのパッケージは`shared`に依存できる
3. **上位層のみ統合**: `toggl-notion-sync`が両クライアントを統合
4. **循環依存の絶対禁止**: パッケージ間・モジュール間の循環依存は許可しない

## Effect-TS 使用ガイドライン

### 基本原則
1. **副作用を明示的に**: すべての副作用は`Effect`型で表現
2. **エラーを型で表現**: エラーチャネルを活用（`Effect<Success, Error, Requirements>`）
3. **依存注入はLayer**: サービスの依存注入は`Layer`と`Context`を使用
4. **合成を重視**: 小さなEffectを組み合わせて大きな処理を構築

### Effect-TSによるDI（依存注入）

#### サービス定義（Application層 - Port）

```typescript
// application/ports/TimeEntryRepository.ts
import { Effect, Context } from "effect";
import type { TimeEntry } from "../../domain/models/TimeEntry";
import type { DateRange } from "../../domain/models/DateRange";

export class TimeEntryRepository extends Context.Tag("TimeEntryRepository")<
  TimeEntryRepository,
  {
    readonly findByDateRange: (
      range: DateRange
    ) => Effect.Effect<readonly TimeEntry[], RepositoryError>;
    readonly create: (
      entry: Omit<TimeEntry, "id">
    ) => Effect.Effect<TimeEntry, RepositoryError>;
  }
>() {}

export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
```

#### アダプター実装（Infrastructure層）

```typescript
// infrastructure/adapters/TogglTimeEntryRepository.ts
import { Effect, Layer } from "effect";
import { TimeEntryRepository } from "../../application/ports/TimeEntryRepository";
import { HttpClient } from "../http/HttpClient";

export const TogglTimeEntryRepositoryLive = Layer.effect(
  TimeEntryRepository,
  Effect.gen(function* (_) {
    const httpClient = yield* _(HttpClient);

    return TimeEntryRepository.of({
      findByDateRange: (range) =>
        Effect.gen(function* (_) {
          const response = yield* _(
            httpClient.get(`/time_entries`, {
              params: {
                start_date: range.start,
                end_date: range.end,
              },
            })
          );
          return yield* _(parseTimeEntries(response));
        }),

      create: (entry) =>
        Effect.gen(function* (_) {
          const response = yield* _(
            httpClient.post(`/time_entries`, { body: entry })
          );
          return yield* _(parseTimeEntry(response));
        }),
    });
  })
);
```

#### ユースケース実装（Application層）

```typescript
// application/usecases/GetTodayTimeEntries.ts
import { Effect } from "effect";
import { TimeEntryRepository } from "../ports/TimeEntryRepository";
import type { TimeEntry } from "../../domain/models/TimeEntry";
import { createDateRange } from "../../domain/models/DateRange";

export const getTodayTimeEntries = Effect.gen(function* (_) {
  const repository = yield* _(TimeEntryRepository);
  const today = yield* _(Effect.sync(() => createDateRange.today()));
  const entries = yield* _(repository.findByDateRange(today));
  return entries;
});
```

#### Layer構成とアプリケーション実行

```typescript
// index.ts
import { Effect, Layer } from "effect";
import { getTodayTimeEntries } from "./application/usecases/GetTodayTimeEntries";
import { TogglTimeEntryRepositoryLive } from "./infrastructure/adapters/TogglTimeEntryRepository";
import { HttpClientLive } from "./infrastructure/http/HttpClient";

// すべての依存関係を組み立て
const AppLayer = TogglTimeEntryRepositoryLive.pipe(
  Layer.provide(HttpClientLive)
);

// アプリケーション実行
const program = getTodayTimeEntries.pipe(
  Effect.provide(AppLayer)
);

// 実行
Effect.runPromise(program).then(console.log).catch(console.error);
```

### エラーハンドリング（Effect-TS）

```typescript
import { Data, Effect } from "effect";

// ドメインエラー定義
export class TimeEntryNotFoundError extends Data.TaggedError("TimeEntryNotFoundError")<{
  readonly id: string;
}> {}

export class InvalidTimeRangeError extends Data.TaggedError("InvalidTimeRangeError")<{
  readonly reason: string;
}> {}

// インフラエラー定義
export class HttpError extends Data.TaggedError("HttpError")<{
  readonly statusCode: number;
  readonly message: string;
}> {}

export class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly cause: unknown;
}> {}

// エラーハンドリング例
const safeGetTimeEntry = (id: string) =>
  getTimeEntry(id).pipe(
    Effect.catchTag("TimeEntryNotFoundError", (error) =>
      Effect.succeed(null) // エラーを処理して成功値に変換
    ),
    Effect.catchTag("HttpError", (error) =>
      Effect.fail(new NetworkError({ cause: error })) // エラーを別のエラーに変換
    )
  );
```

## コーディング規約

### TypeScript
- **strictモード必須**: すべてのパッケージで`strict: true`
- **Effect優先**: 副作用を伴う処理は必ず`Effect`で表現
- **any/unknown禁止**: `any`と`unknown`の使用禁止、代わりに適切な型を定義
- **明示的な型注釈**: 関数の戻り値型は必ず明示
- **JSDoc**: 公開APIには必ずJSDocコメントを付ける
- **immutability**: すべてのデータ構造はimmutable（`readonly`を活用）

### 関数型プログラミング原則

1. **Pure Functions**: 副作用のない純粋関数を優先
2. **Immutability**: データは不変、変更ではなく新しい値を生成
3. **Composition**: 小さな関数を組み合わせて大きな機能を構築
4. **Expression-oriented**: 文ではなく式を優先
5. **Pattern Matching**: `Match`を活用した分岐処理

```typescript
import { Match } from "effect";

const handleResult = Match.type<Result>().pipe(
  Match.tag("Success", (success) => console.log(success.value)),
  Match.tag("Failure", (failure) => console.error(failure.error)),
  Match.exhaustive
);
```

### ドメインモデル設計

```typescript
// domain/models/TimeEntry.ts
import { Data } from "effect";

// Dataを使用したimmutableなドメインモデル
export class TimeEntry extends Data.Class<{
  readonly id: string;
  readonly description: string;
  readonly start: Date;
  readonly stop: Date | null;
  readonly duration: number;
  readonly projectId: string | null;
  readonly tags: ReadonlyArray<string>;
}> {
  // ドメインロジック（純粋関数）
  get isRunning(): boolean {
    return this.stop === null;
  }

  get durationInMinutes(): number {
    return Math.floor(this.duration / 60);
  }

  // ファクトリメソッド
  static create(params: {
    description: string;
    start: Date;
    projectId?: string;
    tags?: ReadonlyArray<string>;
  }): TimeEntry {
    return new TimeEntry({
      id: crypto.randomUUID(),
      description: params.description,
      start: params.start,
      stop: null,
      duration: 0,
      projectId: params.projectId ?? null,
      tags: params.tags ?? [],
    });
  }

  // ドメイン操作
  stop(at: Date): TimeEntry {
    const duration = (at.getTime() - this.start.getTime()) / 1000;
    return new TimeEntry({ ...this, stop: at, duration });
  }
}
```

### 環境変数管理（Effect Config）

```typescript
// shared/src/config/index.ts
import { Config, Effect } from "effect";

export class AppConfig extends Data.Class<{
  readonly toggl: {
    readonly apiToken: string;
    readonly workspaceId: string;
  };
  readonly notion: {
    readonly apiToken: string;
    readonly databaseId: string;
  };
}> {}

export const loadConfig = Effect.gen(function* (_) {
  const togglApiToken = yield* _(Config.string("TOGGL_API_TOKEN"));
  const togglWorkspaceId = yield* _(Config.string("TOGGL_WORKSPACE_ID"));
  const notionApiToken = yield* _(Config.string("NOTION_API_TOKEN"));
  const notionDatabaseId = yield* _(Config.string("NOTION_DAILY_NOTES_DATABASE_ID"));

  return new AppConfig({
    toggl: {
      apiToken: togglApiToken,
      workspaceId: togglWorkspaceId,
    },
    notion: {
      apiToken: notionApiToken,
      databaseId: notionDatabaseId,
    },
  });
});
```

## テスト方針

### 単体テスト
- **カバレッジ目標**: 80%以上（特にドメイン層は100%）
- **テストツール**: Vitest + `@effect/vitest`
- **テスト構造**: ドメイン層は純粋関数なのでモック不要
- **Effect テスト**: `Effect.gen`を使ったテストケース

```typescript
import { Effect } from "effect";
import { expect, it } from "vitest";

it("should create a time entry", () => {
  const entry = TimeEntry.create({
    description: "Test task",
    start: new Date(),
  });

  expect(entry.isRunning).toBe(true);
  expect(entry.description).toBe("Test task");
});

it("should stop a time entry", async () => {
  const program = Effect.gen(function* (_) {
    const entry = TimeEntry.create({
      description: "Test",
      start: new Date(),
    });
    const stopped = entry.stop(new Date());
    return stopped.isRunning;
  });

  const result = await Effect.runPromise(program);
  expect(result).toBe(false);
});
```

### 統合テスト
- **Layer の差し替え**: テスト用Layerを用意してモック化
- **テスト環境**: テスト用のToggl/Notionワークスペース
- **クリーンアップ**: テスト後は必ずデータをクリーンアップ

## リンター設定（ESLint）

後続タスクで以下を設定予定：
- `@typescript-eslint/strict-type-checked`
- `functional/recommended` (eslint-plugin-functional)
- `effect/recommended` (効果的なEffect-TS使用のため)
- `no-any`, `no-explicit-any` 強制
- `prefer-readonly` 強制
- Import順序の強制

## ドキュメント要件

### README.md（各パッケージ）
1. パッケージの目的とユースケース
2. アーキテクチャ概要（層構造）
3. インストール方法
4. 使用例（Effect-TSベース）
5. API仕様（Layerの構成方法含む）
6. 設定方法

### コード内コメント
- 複雑なロジックには説明コメント
- **Why** を記述（What ではなく）
- ドメインの業務ルールは明確にコメント

## セキュリティ

### APIキー管理
- **Effect Config**: 環境変数は`Config`経由でのみ取得
- **コミット禁止**: `.env`ファイルは`.gitignore`
- **ログ禁止**: APIキーをログに出力しない（Effect Loggerで自動マスキング）

### データ保護
- **最小権限**: Notion/TogglのIntegrationは必要最小限の権限
- **個人情報**: タイムエントリの説明文など個人情報の扱いに注意

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
- `domain`, `application`, `infrastructure`（層を明示）

### ブランチ戦略
- `main`: 安定版
- `claude/*`: Claude Codeの作業ブランチ
- `feature/*`: 新機能開発
- `fix/*`: バグ修正

## コード品質管理

### 静的解析の実行タイミング

**コード変更時は必ず静的解析を実行する:**

1. **ファイル編集後**: 変更したファイルに対してlintとフォーマットを実行
   ```bash
   npm run lint:fix      # ESLintによる自動修正
   npm run format        # Oxfmtによる自動フォーマット
   ```

2. **ロジック追加時**: テストを実行して既存機能が壊れていないことを確認
   ```bash
   npm run test:all      # 全パッケージのテスト実行
   ```

3. **コミット前**: Lefthook Git hooksが自動実行（手動実行も推奨）
   ```bash
   npm run check         # lint + format check の一括実行
   ```

### Git Hooks（Lefthook）による自動品質チェック

プロジェクトにはLefthookによる自動品質チェックが設定されている：

**Pre-commit（コミット前）**:
- ✅ Oxlint: 超高速基本チェック（ステージされたファイルのみ）
- ✅ ESLint: 厳格な型チェック + 自動修正（ステージされたファイルのみ）
- ✅ Oxfmt: 自動フォーマット（ステージされたファイルのみ）

**Pre-push（プッシュ前）**:
- ✅ Lint all: 全ファイルの完全なリントチェック
- ✅ Format check: 全ファイルのフォーマットチェック
- ✅ Test all: 全パッケージのテスト実行

**Commit-msg（コミットメッセージ検証）**:
- ✅ Conventional Commits形式の強制

### Claude Codeの実装ルール

**コード変更を行う際は以下の順序で作業する:**

1. **コード実装**: 機能追加・修正を行う
2. **静的解析**: `npm run lint:fix` でlintエラーを修正
3. **フォーマット**: `npm run format` でコードを整形
4. **テスト実行**: `npm run test:all` で全テストが通ることを確認
5. **コミット**: Git hooksが自動的に品質チェックを実行
6. **プッシュ**: 再度すべてのチェックが実行される

**重要な注意事項:**
- ⚠️ **Git hooksでエラーが出た場合**: コミット/プッシュは失敗する。必ずエラーを修正してから再試行
- ⚠️ **警告は許容**: ESLintの警告（warning）は許可されているが、エラー（error）は許可されない
- ⚠️ **フォーマットの統一**: 手動でフォーマットを変更せず、必ずOxfmtに任せる
- ✅ **プッシュ前の最終確認**: `npm run check` を実行してすべての品質基準をクリアしていることを確認

### Linter設定

現在の設定（Oxlint + ESLint ハイブリッド構成）:

**Oxlint（超高速基本チェック）**:
- TypeScript、Correctness、Suspicious、Perf、Style、Nursery ルール有効
- 50-100倍高速なベースライン品質チェック

**ESLint（厳格な型チェック）**:
- `@typescript-eslint/strict-type-checked`: 最も厳格な型チェック
- `@effect/eslint-plugin`: Effect-TS専用ルール
- `eslint-plugin-functional`: 関数型プログラミング強制
- `eslint-plugin-import-x`: Import順序とモジュール管理
- `eslint-plugin-sonarjs`: 複雑度チェック
- `eslint-plugin-unicorn`: モダンなベストプラクティス
- その他: Promise、JSDoc、Vitestルール

**デモコードの特例**:
現在のパッケージ（frontend/backend/shared）はデモコードのため、一部の厳格ルールを警告レベルに緩和。
新規パッケージ（toggl-client/notion-client等）では厳格ルールを完全適用する。

## 優先事項

### フェーズ1: 基礎構築とアーキテクチャ確立
1. ✅ モノレポ環境構築
2. ✅ AGENT.md策定
3. ✅ ESLint厳格設定（Oxlint + ESLint ハイブリッド構成 + Lefthook Git hooks）
4. 🔄 `toggl-client` パッケージ作成（ポートアンドアダプター構造）
5. 🔄 `notion-client` パッケージ作成（ポートアンドアダプター構造）
6. 🔄 共通型定義とEffect Layerの整備（`shared`）

### フェーズ2: 同期機能
1. デイリーノートフォーマット設計（ドメインモデル）
2. 同期ユースケース実装（`toggl-notion-sync`）
3. スケジュール実行機能（Effect Schedule）
4. エラーハンドリングと再試行（Effect Retry）

### フェーズ3: CLIツール
1. CLIフレームワーク選定（Effect CLI or @effect/cli）
2. Toggl操作コマンド（start, stop, list, etc.）
3. 設定管理（Effect Config）
4. インタラクティブモード

### フェーズ4: 拡張機能
1. Webダッシュボード
2. Webhook対応
3. カスタムレポート
4. 他サービス連携

## Claude Codeへの指示

### 実装時の注意
1. **Effect-TS優先**: すべての副作用は`Effect`で表現
2. **依存関係の方向**: Domain ← Application ← Infrastructure を厳守
3. **ポート定義**: Applicationでインターフェース、Infrastructureで実装
4. **Layer構成**: DIは必ずEffect Layerで実現
5. **段階的実装**: 小さく分割して実装
6. **テスト優先**: ドメイン層は必ずテスト
7. **ドキュメント同期**: コード変更時はドキュメントも更新
8. **型安全第一**: 型エラーは絶対に放置しない
9. **関数型思考**: 純粋関数とimmutabilityを優先
10. **静的解析の実行**: コード変更後は必ず `npm run lint:fix` → `npm run format` → `npm run test:all` を実行

### 質問すべき状況
- ドメインモデルの設計判断
- ポート（インターフェース）の粒度
- Layer構成の最適化
- ユースケースの境界
- デイリーノートのフォーマット

### 避けるべきこと
- **依存関係の逆転**: InfrastructureがApplicationに依存するのはOK、逆はNG
- **ドメイン層の汚染**: ドメイン層に外部ライブラリ依存を持ち込まない
- **any/unknown使用**: 型を適切に定義
- **副作用の隠蔽**: `Effect`を使わずに副作用を実行
- **Mutableな状態**: `readonly`を使用して不変性を保証
- **循環依存**: パッケージ・モジュール間の循環依存
- **テストなし実装**: 特にドメイン層

## 参考リソース

### 技術仕様
- Effect-TS: https://effect.website/
- Toggl Track API: https://developers.track.toggl.com/docs/
- Notion API: https://developers.notion.com/

### ライブラリ
- **Effect-TS**: `effect` (コア)
- **HTTP Client**: `@effect/platform` (HttpClient)
- **スキーマ**: `@effect/schema` (バリデーション・パース)
- **日付処理**: `effect` (Duration, DateTime) または `@effect/data`
- **CLI**: `@effect/cli`
- **設定**: `effect` (Config)
- **ログ**: `effect` (Logger)

### アーキテクチャパターン
- ポートアンドアダプター（ヘキサゴナルアーキテクチャ）
- ドメイン駆動設計（DDD）
- 関数型プログラミング
- CQRS（将来的に）

---

**最終更新**: 2025-10-23
**バージョン**: 2.1.0 - コード品質管理セクション追加（Lefthook Git hooks統合）
