# API仕様

バックエンドAPIのエンドポイント仕様です。

## ベースURL

```
http://localhost:4000/api
```

## エンドポイント

### ヘルスチェック

```http
GET /api/health
```

**レスポンス例:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-21T14:30:00.000Z"
}
```

### データ取得

#### すべてのデータ

```http
GET /api/data
```

**レスポンス例:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com"
    }
  ],
  "stats": {
    "totalUsers": 3,
    "activeUsers": 2,
    "lastUpdate": "2025-10-21T14:30:00.000Z"
  }
}
```

#### ユーザー一覧

```http
GET /api/data/users
```

**レスポンス例:**
```json
[
  {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com"
  },
  {
    "id": 2,
    "name": "佐藤花子",
    "email": "sato@example.com"
  }
]
```

#### 特定ユーザー

```http
GET /api/data/users/:id
```

**パラメータ:**
- `id` (number) - ユーザーID

**レスポンス例（成功）:**
```json
{
  "id": 1,
  "name": "田中太郎",
  "email": "tanaka@example.com"
}
```

**レスポンス例（エラー）:**
```json
{
  "error": "User not found"
}
```

#### 統計情報

```http
GET /api/data/stats
```

**レスポンス例:**
```json
{
  "totalUsers": 3,
  "activeUsers": 2,
  "lastUpdate": "2025-10-21T14:30:00.000Z"
}
```

## エラーハンドリング

すべてのエラーは以下の形式で返されます：

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## CORS

開発環境ではすべてのオリジンからのアクセスを許可しています。

## レート制限

現在、レート制限は実装されていません。
