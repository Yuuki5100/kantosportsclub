了解！  

### 📘 システム設計書：Teams → GitLab Wiki 連携システム

---

## 1. 🎯 システム概要

本システムは、**Microsoft Teamsに投稿されたメッセージのうち、特定のキーワード（@wiki 等）を含むものを検出し、GitLab Wiki に自動転記する**ことを目的とする。

- GitLabは AWS 上の EC2 に構築済み
- 本システムは、GitLab EC2 上に **Webhook Gatewayアプリ** を設置し、TeamsからのPOSTを受けてGitLab Wiki APIと連携する構成とする

---

## 2. 🏗️ システム構成図

```plaintext
+-------------------+            +------------------------------+
| Microsoft Teams   |  ----→     | Gatewayアプリ (Spring Boot等)|
| (Outgoing Webhook)|   POST     | on GitLab EC2                |
+-------------------+            +---------------+--------------+
                                                |
                                                | 内部API呼び出し
                                                v
                                     +----------+----------+
                                     | GitLab Wiki API     |
                                     +----------------------+
```

---

## 3. 🧩 コンポーネント構成

### 3.1 Microsoft Teams（送信元）
- **Outgoing Webhook** 機能を使用し、チャネルへの投稿を検知
- 投稿内容に `@wiki` などのトリガータグが含まれている場合、GatewayにPOST送信

### 3.2 Gatewayアプリ（GitLab EC2上）
- Spring Boot等で構築
- `/webhook` エンドポイントでPOST受信
- 投稿内容を解析・フォーマット
- GitLab Wiki API を呼び出し、指定ページに追記 or 新規作成

### 3.3 GitLab Wiki API
- GitLabが提供するREST APIを使用
  - POST `/projects/:id/wikis`（新規作成）
  - PUT `/projects/:id/wikis/:slug`（更新）

---

## 4. 🔄 処理フロー

1. ユーザーがTeamsで `@wiki` を含む投稿をする
2. TeamsのOutgoing WebhookがGatewayの `/webhook` にPOST
3. Gatewayがメッセージ内容を受信・整形（投稿者、日付、本文など）
4. GitLab Wiki APIを通じて対象ページに追記（または新規ページ作成）
5. 結果（成功／失敗）をログとして保存、必要に応じてTeamsへ返信

---

## 5. 📂 Wiki書き込みフォーマット（例）

```markdown
### 2025-03-28 10:42 投稿

**投稿者**: @taro  
**内容**:  
これはTeamsからのメモです。  
- メモ1  
- メモ2  

---
```

---

## 6. 🔐 セキュリティ設計

| 対象 | 対応 |
|------|------|
| Webhook認証 | 固定トークンを `X-Webhook-Secret` ヘッダーで受信し検証 |
| GitLab API認証 | Personal Access Token を `.env` またはAWS Secrets Managerで管理 |
| IP制限 | 任意（Microsoft IPレンジ制限または省略） |
| HTTPS対応 | Nginxを使い、Let's EncryptなどでTLS化 |

---

## 7. 🛠 運用・メンテナンス

| 項目 | 内容 |
|------|------|
| ログ管理 | ローカルログファイルに処理記録。必要に応じてCloudWatch等にも転送可能 |
| 障害通知 | 失敗時にTeamsへ返信通知（Webhook経由）またはSlack通知 |
| メンテ作業 | Gatewayアプリの更新／再起動（systemd or Docker管理） |
| バックアップ | GitLab WikiはGitリポジトリベースで自動バックアップ対象 |

---

## 8. 📎 使用技術

| 項目 | 技術 |
|------|------|
| Gatewayアプリ | Spring Boot 3.x（または Node.js / Flask等でも可） |
| デプロイ | GitLab EC2（Amazon Linux / Ubuntu） |
| リバースプロキシ | Nginx |
| 認証 | GitLab API Token / Webhook Secret |
| 通信 | HTTPS (443) / GitLab API (localhost) |

---

## 9. 🧪 拡張・将来対応案

- 投稿テンプレのカスタマイズ（Markdownテンプレ選択）
- GitLab以外のサービス連携（Confluence, Notionなど）
- 投稿ごとに分類・ラベル付け（#タグでWikiページ分岐）
- AIによる自動サマリ化投稿（生成系API連携）

---

## 10. 📌 補足・注意点

- EC2の外部公開設定に注意（HTTPSのみ、必要ポート最小限）
- GatewayアプリはGitLab本体とは別プロセスで構成する
- Webhookトークンは定期的なローテーションを検討

---
