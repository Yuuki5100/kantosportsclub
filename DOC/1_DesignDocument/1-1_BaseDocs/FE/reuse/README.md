# reuse README

> 共通前置き
> - 本資料群は既存の設計書・実装構造の再利用判断を支援するための入口資料である。
> - 仕様書に記載のない推測は行わず、不明点は「要確認」として扱う。
> - この README だけで判定せず、必ず `module-reuse-catalog.md` と `reuse-decision-flow.md` を併用する。

## 1. 概要
`DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse` は、フロントエンド共通基盤の再利用可否を判断するための索引・判断基準・運用ルールをまとめた資料群である。対象は `DOC/1_DesignDocument/1-1_BaseDocs/FE` 配下の既存設計書と、その設計が示す実装構造である。

FE 基本文書の構成は以下の通りであり、reuse はその横断ガイドの位置付けとなる。
- `00_overview`: 全体目次と参照の入口
- `01_architecture`: 設計方針（フォルダ構成、環境変数、言語切替、Redux）
- `02_application-foundation`: 認証・API・エラー/ログ・通知などの横断基盤
- `03_realtime/websocket`: WebSocket 連携の設計
- `04_features`: 機能単位の設計（例: file-handling）
- `modules`: UI/コンポーネント群（base/composite/functional/examples）

base/composite/functional/examples の違いは以下の通り。
- base: 原子的なUI部品や最小単位のレイアウト（ボタン、入力、スペーサー等）
- composite: base を組み合わせて画面構造や共通UIを構成（Header、ListView、Modal 等）
- functional: 状態やロジックを伴う表示・機能コンポーネント（例: UserUpdateForm）
- examples: 使い方・結合例のサンプル（本番仕様ではなく使用例）

実装構造とドキュメント構造の対応は以下の通り。
- `modules/base` ↔ `src/components/base`
- `modules/composite` ↔ `src/components/composite`、`src/components/layout`
- `modules/functional` ↔ `src/components/functional`
- `modules/examples` ↔ `src/pages` などの使用例
- `02_application-foundation` ↔ `src/api`、`src/hooks`、`src/slices`、`src/utils`、`src/config`
- `03_realtime/websocket` ↔ `src/utils/webSocketClient`、`src/hooks/useWSSubscription`、`src/components/providers`、`src/components/composite/SnackbarListener`
- `01_architecture/Dir.md` ↔ `src` 配下の全体構成

## 2. この資料群の目的
- 既存の共通モジュール/基盤の再利用可否を判断できる状態を作る。
- 再利用の前提・制約・依存関係を明確化し、重複実装を防ぐ。
- 新規機能追加時の参照順・判断順を統一する。
- この README 単体では判断せず、必ず `module-reuse-catalog.md` と `reuse-decision-flow.md` を併用する。

## 3. 想定利用者
- 人間の開発者: 新機能設計時に既存資産の再利用可否を判断する担当者
- 開発エージェント: 既存設計書の参照順と再利用判断を自動化する実装補助者

## 4. 利用シーン
- 新機能追加
- 既存画面改修
- 共通部品選定
- API連携追加
- WebSocket連携追加

## 5. 参照すべき既存ドキュメント群
- `00_overview`
- `01_architecture`
- `02_application-foundation`
- `03_realtime/websocket`
- `04_features`
- `modules/base`
- `modules/composite`
- `modules/functional`
- `modules/examples`

## 6. reuse 配下の各資料の役割
- `module-reuse-catalog.md`: 再利用判断用の台帳（一覧/比較/制約/依存の要点）
- `reuse-decision-flow.md`: 再利用判定の手順書（分岐・確認ポイント）
- `capability-matrix.md`: 機能網羅性の可視化（何が既にあるか）
- `dependency-map.md`: 依存関係の俯瞰（横断基盤とUIの接続）
- `implementation-patterns.md`: 推奨実装パターン（再利用前提の定石）
- `anti-patterns.md`: 再利用時の避けるべき実装
- `glossary.md`: 用語・分類の定義

## 7. エージェントの利用手順
1. `README.md` で対象範囲と参照順を把握する。
2. `module-reuse-catalog.md` で該当領域の候補を特定する。
3. `reuse-decision-flow.md` に沿って再利用可否を判断する。
4. `capability-matrix.md` と `dependency-map.md` で横断基盤の影響範囲を確認する。
5. `implementation-patterns.md` と `anti-patterns.md` で実装方針を確定する。

再利用判定の進め方は以下の順で行う。
1. 機能単位かUI部品かを切り分ける。
2. `module-reuse-catalog.md` の該当行を確認し、制約・依存・拡張ポイントを把握する。
3. `reuse-decision-flow.md` の分岐で再利用/改修/新規のいずれかを決定する。
4. 不明点がある場合は「要確認」として関係資料に追記し、判断を保留する。

## 8. 運用ルール
- 新モジュール追加時: 既存の分類（base/composite/functional/feature/foundation）に沿って資料と台帳を追加し、依存関係を `dependency-map.md` に反映する。
- 既存モジュール改修時: 影響範囲を `module-reuse-catalog.md` と `capability-matrix.md` に追記し、差分の理由を明記する。
- 廃止時: 参照元一覧と台帳に「廃止」明記し、代替候補があれば併記する。

## 9. 更新フロー
1. 変更対象の設計書（既存ドキュメント群）を更新する。
2. `module-reuse-catalog.md` に該当行の変更点を反映する。
3. 依存関係が変わる場合は `dependency-map.md` を更新する。
4. 機能網羅性が変わる場合は `capability-matrix.md` を更新する。
5. 更新内容を参照元一覧に記録する。

## 10. 参照元一覧
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/00_overview/README.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Dir.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Env.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Lang.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/Redux.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/APIConnectModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/Auth-API.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/AuthModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/ErrorHandle.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/FullAPI.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/logModule.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/SnackBar.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/GlobalWebsocket.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/webSocketFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/websocket/websocket-usage-examples.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileImport.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/FileUploaderFront.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/file-handling/manifestCheck.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/base`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/composite`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/functional`
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/examples`
