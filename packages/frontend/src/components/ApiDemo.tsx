import { useState } from "react";
import "./ApiDemo.css";

export default function ApiDemo() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error("API request failed");
      }
      const result = await response.json();
      setData(result);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-demo">
      <h2>API連携デモ</h2>

      <div className="api-controls">
        <button onClick={fetchData} disabled={loading}>
          {loading ? "読み込み中..." : "データ取得"}
        </button>
      </div>

      {error && (
        <div className="error">
          <p>エラー: {error}</p>
          <p className="hint">
            バックエンドサーバーが起動していることを確認してください。
          </p>
        </div>
      )}

      {data && (
        <div className="api-result">
          <h3>取得データ:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      <div className="api-info">
        <h3>API情報</h3>
        <ul>
          <li>
            エンドポイント: <code>GET /api/data</code>
          </li>
          <li>
            バックエンド: <code>http://localhost:4000</code>
          </li>
          <li>プロキシ設定: Vite開発サーバー経由</li>
        </ul>
      </div>
    </div>
  );
}
