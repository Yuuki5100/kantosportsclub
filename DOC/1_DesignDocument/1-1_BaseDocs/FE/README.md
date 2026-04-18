# Frontend ドキュメント構造

## 概要

本ドキュメントは、フロントエンドの設計資料を体系的に整理するための構造を定義する。

目的：

* ドキュメントの探索性向上
* 実装構造との対応付け
* 責務ごとの分離
* 保守性の向上

---

## ディレクトリ構造

```text
docs/frontend/
├─ 00_overview/                 # 総覧
├─ 01_architecture/             # アーキテクチャ基盤
├─ 02_application-foundation/   # 共通アプリ基盤
├─ 03_realtime/                 # リアルタイム通信
└─ 04_features/                 # 業務機能 / UI機能

DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/
├─ base/                        # 最小単位UI・汎用部品
├─ composite/                   # 複合UI・レイアウト構造
├─ functional/                  # 業務機能レベル
└─ examples/                    # 使用例・サンプル
```

---

## 各カテゴリの定義

### 00_overview（総覧）

プロジェクト全体の入口となるドキュメント。

* README
* info
* 全体構成説明

---

### 01_architecture（アーキテクチャ基盤）

フロントエンドの構造・設計思想を定義する。

対象：

* ディレクトリ構成
* 状態管理（Redux等）
* 環境設定
* i18n

---

### 02_application-foundation（共通アプリ基盤）

アプリケーション全体で共通利用される基盤機能。

対象：

* 認証・認可
* API通信
* エラーハンドリング
* ログ・監視
* 通知（SnackBar等）
* メッセージカタログ（MessageCatalog）

---

### 03_realtime（リアルタイム通信）

WebSocket等のリアルタイム通信に関する設計。

対象：

* 接続管理
* 状態同期
* 実装パターン
* 利用例

---

### 04_features（業務機能 / UI機能）

業務ロジックまたは画面単位の機能設計。

対象：

* ファイル処理
* フォーム機能
* 業務ロジック

---

## modules 配下の設計方針

UIコンポーネントは責務に応じて3層に分類する。

### base

最小単位の再利用可能コンポーネント。

例：

* Input
* Button
* Typography
* Layout
* Utility
* MessageCatalog（MessageCatalog.md）

特徴：

* 状態を持たない or 最小限
* 業務ロジックを含まない
* 汎用性が高い

---

### composite

複数のbaseコンポーネントを組み合わせたUI。

例：

* Header / Footer
* SideMenu
* ListView
* Modal

特徴：

* UI構造を持つ
* 状態を持つことがある
* 再利用可能だが用途が限定される

---

### functional

業務ロジックを含む機能単位。

例：

* UserUpdateForm

特徴：

* API連携を含む
* 状態管理を含む
* 特定機能に依存

---

### examples

コンポーネントの利用例。

特徴：

* 実装ガイド用途
* 本番ロジックを含まない

---

## 分類ルール

### base に置くもの

* 単一責務
* 業務知識を持たない
* 汎用的

### composite に置くもの

* 複数コンポーネントを組み合わせる
* UI構造を持つ

### functional に置くもの

* APIや業務ロジックを含む
* 画面/機能単位

### examples に置くもの

* 利用サンプル
* デモコード

---

## 運用ルール

* ファイル名は変更しない
* 構造変更時はREADMEを更新する
* 同一責務の重複ドキュメントは作らない
* module分類は実装構造と一致させる

---

## 今後の拡張

* 各ディレクトリに index.md を追加
* 依存関係図の生成
* 自動分類スクリプトの導入

---

以上。
