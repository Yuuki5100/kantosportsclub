# 管理者向けユーザー一覧画面 レビュー結果

## 1. 検証結果サマリ
- 判定: 条件付き合格
- 総評: 画面構成と共通資産再利用は概ね設計書に沿っていますが、検索（email/status）とソートが実質未対応で要件未充足です。既存E2Eが参照している `searchName` の変更による回帰リスクもあります。

## 2. 設計書準拠チェック
- 満たしている点
- 検索条件・一覧・詳細遷移の画面構成が設計書と一致
- `ControllableListView` を使用し、一覧・ページング UI を共通部品で実装
- `ProtectedRoute` と `pageConfig` による認証・認可の流れに従っている
- `/admin/user/list` ルートが `pageConfig` で管理されている

- 満たしていない点
- email/status の検索条件が API に渡されていない
- ソートは UI 上存在するが API 連携がなく実質未動作
- ステータスの表示が `isLocked` 由来の暫定値になっている
- 初期件数が設計書（20）と異なり 50

- 要確認事項
- email/status のAPIパラメータ・レスポンス正式仕様
- sortKey/sortOrder のAPI対応可否
- ステータス候補の取得方法
- 初期件数（20 or 50）の正式決定

## 3. 再利用チェック
- 適切に再利用できている既存資産
- `ControllableListView`
- `FormRow`
- `TextBox`
- `DropBox`
- `ButtonBase`
- `useSnackbar`
- `getUserListApi`
- `getRoleDropdownApi`
- `ProtectedRoute`
- `pageConfig`
- `BasePage`（`_app.tsx` 経由）

- 再利用不足の箇所
- 特になし（既存のAPI/通知基盤を迂回していない）

- 独自実装してしまっている箇所
- 検索条件の email/status が UI のみで未連携（設計要件未充足）

## 4. 問題点一覧
- 重要度: 高
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: ソート操作が API に連携されず実質未動作
- 設計書または既存方針とのズレ: 詳細設計書ではサーバーサイドソート前提
- 修正案: BE対応後に `sortKey/sortOrder` をクエリに反映。BE未対応の間はソートUIを無効化するか「要確認」表示

- 重要度: 中
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: email/status 検索が API に渡されない
- 設計書または既存方針とのズレ: 基本設計書・詳細設計書に検索条件として明記
- 修正案: BEの正式仕様確定後にクエリへ追加。確定まで一時的にUIを無効化 or 注意文を表示

- 重要度: 中
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: `status` 表示が `isLocked` の暫定値
- 設計書または既存方針とのズレ: 設計書ではステータス候補から表示
- 修正案: status master の仕様確定後に表示/検索を連動

- 重要度: 中
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: 既存E2Eで参照される `searchName` が `searchUserName` に変更
- 設計書または既存方針とのズレ: 既存実装・テストとの互換性
- 修正案: `name="searchName"` を維持するか、テスト側を更新

- 重要度: 低
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: 初期件数が設計書(20)と異なり50
- 設計書または既存方針とのズレ: 詳細設計書の初期値
- 修正案: 正式決定後に数値を統一

- 重要度: 低
- 該当ファイル: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
- 問題内容: 行クリック遷移が未実装（詳細ボタンのみ）
- 設計書または既存方針とのズレ: 基本設計書は行クリック遷移を明記
- 修正案: `ControllableListView` の `onRowClick` を追加する

## 5. 破壊的変更リスク
- 有
- 内容: `searchName` 変更によるE2E/自動化の破壊
- 影響範囲: `FE/spa-next/my-next-app/src/tests/it/user/*`

- 有
- 内容: 詳細画面からの戻り先が `/admin/user/list` に固定化
- 影響範囲: `/user/list` を使っていた利用フロー

## 6. 修正優先順位
1. ソート機能の未対応整理（API反映 or UI無効化）
2. email/status 検索の未対応整理（API反映 or UI無効化）
3. `searchName` の互換性対応
4. status 表示の正式仕様反映
5. 行クリック遷移の追加

## 7. 最終判定
- このままマージ可能か: 条件付き（上記 高/中 を解消 or 要確認の明示が必要）
- 修正後に再確認が必要か: 必要
- テスト実行: 未実施
