#!/usr/bin/env python3
"""
Claude Code デモ - CLIツール
バックエンドAPIと連携してデータを取得・表示します
"""

import click
import requests
import json
from typing import Optional

API_BASE_URL = "http://localhost:4000/api"


def fetch_api(endpoint: str) -> Optional[dict]:
    """APIからデータを取得"""
    try:
        response = requests.get(f"{API_BASE_URL}/{endpoint}", timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.ConnectionError:
        click.echo(
            click.style("❌ エラー: APIサーバーに接続できません", fg="red")
        )
        click.echo("バックエンドサーバーが起動していることを確認してください。")
        return None
    except requests.exceptions.Timeout:
        click.echo(
            click.style("❌ エラー: リクエストがタイムアウトしました", fg="red")
        )
        return None
    except requests.exceptions.RequestException as e:
        click.echo(
            click.style(f"❌ エラー: {e}", fg="red")
        )
        return None


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """Claude Code デモ - CLIツール"""
    pass


@cli.command()
def health():
    """APIサーバーのヘルスチェック"""
    click.echo("🔍 APIサーバーをチェック中...")
    data = fetch_api("health")
    if data:
        click.echo(click.style("✅ APIサーバーは正常に動作しています", fg="green"))
        click.echo(f"タイムスタンプ: {data.get('timestamp', 'N/A')}")


@cli.command()
def fetch():
    """すべてのデータを取得"""
    click.echo("📥 データを取得中...")
    data = fetch_api("data")
    if data:
        click.echo(click.style("\n✅ データ取得成功", fg="green"))
        click.echo(json.dumps(data, ensure_ascii=False, indent=2))


@cli.command()
def users():
    """ユーザー一覧を表示"""
    click.echo("👥 ユーザー一覧を取得中...")
    data = fetch_api("data/users")
    if data:
        click.echo(click.style("\n✅ ユーザー一覧", fg="green"))
        for user in data:
            click.echo(f"\n[ID: {user['id']}]")
            click.echo(f"  名前: {user['name']}")
            click.echo(f"  メール: {user['email']}")


@cli.command()
@click.argument("user_id", type=int)
def user(user_id):
    """特定のユーザー情報を表示"""
    click.echo(f"🔍 ユーザー {user_id} の情報を取得中...")
    data = fetch_api(f"data/users/{user_id}")
    if data:
        if "error" in data:
            click.echo(click.style(f"❌ {data['error']}", fg="red"))
        else:
            click.echo(click.style("\n✅ ユーザー情報", fg="green"))
            click.echo(f"ID: {data['id']}")
            click.echo(f"名前: {data['name']}")
            click.echo(f"メール: {data['email']}")


@cli.command()
def stats():
    """統計情報を表示"""
    click.echo("📊 統計情報を取得中...")
    data = fetch_api("data/stats")
    if data:
        click.echo(click.style("\n✅ 統計情報", fg="green"))
        click.echo(f"総ユーザー数: {data['totalUsers']}")
        click.echo(f"アクティブユーザー数: {data['activeUsers']}")
        click.echo(f"最終更新: {data['lastUpdate']}")


if __name__ == "__main__":
    cli()
