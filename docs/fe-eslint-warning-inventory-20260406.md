# FE ESLint Warning 棚卸し 2026-04-06

## 1. 目的

W06 では FE ESLint warning を再計測し、W07 / W08 / W09 / W10 へ安全に分割できる粒度で整理する。

基準コマンド:

- `bash docker/stack.sh test-fe`
- `docker compose -f docker/compose.yml --profile test run --rm frontend-test sh -lc 'npm run -s lint -- --format json > /app/eslint-report.json'`

最新計測結果:

- `0 errors / 128 warnings`
- warning ルールは 5 カテゴリ

## 2. カテゴリ別サマリ

| 担当 | ルール | warning件数 | ファイル数 | 優先度 | 代表ファイル | 境界メモ |
|------|--------|------------:|-----------:|--------|--------------|----------|
| W07 | `@typescript-eslint/no-unused-vars` | 34 | 20 | 高 | `src/components/composite/Header/Header.tsx`, `src/pages/login/index.tsx`, `src/utils/SessionTimeoutProvider.tsx` | import / 変数 / 引数の機械的整理が中心。副作用確認は軽めで進めやすい |
| W08 | `@typescript-eslint/no-explicit-any` | 79 | 19 | 中 | `src/mocks/index.ts`, `src/tests/it/notice/notice.helpers.ts`, `src/utils/webSocketClient.ts` | 件数最大。`src/mocks` + `src/tests/it` に 57 件あり、テスト補助から先に進めると安全 |
| W09 | `react-hooks/exhaustive-deps` | 13 | 11 | 高 | `src/components/functional/UserListPage.tsx`, `src/pages/role/list/index.tsx`, `src/pages/_app.tsx` | 件数は少ないが挙動影響がある。依存配列だけでなく再取得・再描画確認が必要 |
| W10 | `@next/next/no-img-element` | 1 | 1 | 低 | `src/pages/login/index.tsx` | `next/image` へ移すか、意図的許容かの方針決めが先 |
| W06 補助 | その他 | 1 | 1 | 低 | `public/mockServiceWorker.js` | generated file の unused eslint-disable。W07〜W10 とは切り離して扱う |

## 3. 推奨着手順

1. W07 `no-unused-vars`
2. W08 `no-explicit-any`
3. W09 `react-hooks/exhaustive-deps`
4. W10 `no-img-element`
5. その他 1 件は generated asset / lint 設定見直しとして別扱い

理由:

- W07 は 34 件あるが機械的に減らしやすく、warning 総数を安全に落としやすい
- W08 は 79 件で最大だが、`src/mocks` と `src/tests/it` に偏っているため「テスト補助」と「本番コード」を分けて進められる
- W09 は件数よりも挙動確認コストが重く、W07 / W08 後に集中して扱う方が安全
- W10 は単独 1 件のため、画像最適化方針の決定後で十分

## 4. 詳細棚卸し

### 4.1 `@typescript-eslint/no-explicit-any`

- 79 warnings / 19 files
- 分布
  - `src/tests/it`: 36
  - `src/mocks`: 21
  - `src/utils`: 7
  - `src/components`: 4
  - `src/hooks`: 4
  - `src/api`: 3
  - `src/pages`: 3
  - `scripts`: 1
- 代表ファイル
  - 21: `FE/spa-next/my-next-app/src/mocks/index.ts`
  - 6: `FE/spa-next/my-next-app/src/tests/it/notice/notice.helpers.ts`
  - 5: `FE/spa-next/my-next-app/src/tests/it/manual/manual.helpers.ts`
  - 5: `FE/spa-next/my-next-app/src/tests/it/role/role.helpers.ts`
  - 5: `FE/spa-next/my-next-app/src/tests/it/setting/setting-it.spec.ts`
  - 5: `FE/spa-next/my-next-app/src/tests/it/user/user.helpers.ts`
- 着手メモ
  - 第1段階: `src/mocks/index.ts` と `src/tests/it/**/*.ts` を分けて置換方針を揃える
  - 第2段階: `WebSocketProvider` / `useWSSubscription` / `webSocketClient` など実行時コードへ展開する
  - `serviceSelector.ts` や `authService.ts` は API レスポンス型の共通化とセットで触る

### 4.2 `@typescript-eslint/no-unused-vars`

- 34 warnings / 20 files
- 分布
  - `src/pages`: 12
  - `src/components`: 10
  - `src/utils`: 4
  - `src/api`: 3
  - `scripts`: 2
  - `src/config`: 2
  - `src/mocks`: 1
- 代表ファイル
  - 4: `FE/spa-next/my-next-app/src/components/composite/Header/Header.tsx`
  - 4: `FE/spa-next/my-next-app/src/pages/login/index.tsx`
  - 4: `FE/spa-next/my-next-app/src/utils/SessionTimeoutProvider.tsx`
  - 3: `FE/spa-next/my-next-app/src/components/base/utils/CommonAccordion.tsx`
- 着手メモ
  - import 削除、未使用 state / handler 削除、未使用引数の `_` 接頭辞化を分けて進める
  - `login/index.tsx` は W10 と同一ファイルだが、`no-img-element` 対応とは分離して小さく進める
  - `SessionTimeoutProvider.tsx` は `no-explicit-any` も混在するため、W07 は未使用 import のみ扱い、型整理は W08 に残す

### 4.3 `react-hooks/exhaustive-deps`

- 13 warnings / 11 files
- 分布
  - `src/pages`: 10
  - `src/components`: 3
- 代表ファイル
  - 2: `FE/spa-next/my-next-app/src/components/functional/UserListPage.tsx`
  - 2: `FE/spa-next/my-next-app/src/pages/role/list/index.tsx`
  - 1: `FE/spa-next/my-next-app/src/components/CRJ/batchResults/BatchResults.tsx`
  - 1: `FE/spa-next/my-next-app/src/pages/_app.tsx`
- 着手メモ
  - 一律対応ではなく「fetch 条件」「ページング state」「memo 化コールバック」の3系統に分けて確認する
  - `UserListPage.tsx` と `role/list/index.tsx` は warning 2 件ずつで、一覧画面系の共通パターン確認に向く
  - `pages/_app.tsx` は unnecessary dependency なので、単純追加ではなく依存の意味を確認する

### 4.4 `@next/next/no-img-element`

- 1 warning / 1 file
- 対象
  - 1: `FE/spa-next/my-next-app/src/pages/login/index.tsx`
- 着手メモ
  - ログイン画面の画像要件を確認し、`next/image` 化か現状維持かを先に決める
  - W07 の未使用変数整理と同一ファイルだが、PR は分離した方がレビューしやすい

### 4.5 その他

- 1 warning / 1 file
- 対象
  - 1: `FE/spa-next/my-next-app/public/mockServiceWorker.js`
- 着手メモ
  - generated file の `Unused eslint-disable directive`
  - アプリ本体の設計変更ではないため、W07〜W10 へは含めず別の軽微タスクとして扱う

## 5. W07〜W10 の作業境界

- W07 は未使用 import / 変数 / 引数の整理に限定する
- W08 は `any` の置換方針と共通型整備に集中し、不要変数削除は抱え込まない
- W09 は hooks の挙動確認を伴う箇所だけを扱い、lint suppress の追加で終わらせない
- W10 は `login/index.tsx` の画像方針決定に限定し、同ファイル内の他 warning は W07 側で処理する
- `public/mockServiceWorker.js` は generated asset のため、W07〜W10 の完了条件から外してよい
