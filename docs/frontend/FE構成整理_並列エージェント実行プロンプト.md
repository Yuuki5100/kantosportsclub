# FE構成整理 並列エージェント実行プロンプト

## 1. 目的

`docs/frontend/FE構成整理_実行計画.md` に基づき、並列実行可能な未完了タスクをエージェント単位へ分解し、各エージェントが以下を自走できるようにする。

1. 新規 worktree を作成
2. 担当タスクを実施
3. 検証結果を証跡として含めてローカルの `develop` へマージし、後片付けまで実施する

なお、本書は 2026-04-06 時点の `develop` コミット履歴を反映済みであり、完了済みタスクの詳細プロンプトは削除している。現時点では MR を作成せず、各タスク完了後はローカルの `develop` へマージして worktree と作業ブランチを削除する。

---

## 2. 並列実行方針

### 2.1 並列実行しやすい単位

以下は、ファイル衝突が比較的少なく、原則としてタスク単位で並列実行しやすい。

| Wave | 並列実行候補 | 主対象 |
|------|--------------|--------|
| Wave 1 | T05 / T04 | Redux hooks 方針決定、Jest 型定義統合 |
| Wave 2 | T07 | Storybook preview 一本化 |
| Wave 3 | T08 / T09 / T10 | auth-mock-server、analysis、Storybook サンプル整理 |

### 2.2 依存と注意

- `T04` と `T07` は設定変更を含むため、単独ブランチで作業し単独で `develop` へマージする
- `T08` `T09` `T10` は低優先だが、相互依存は薄いため並列実行可能
- 全タスク共通で、`FE/spa-next/my-next-app` の移設は禁止
- 画面仕様や業務ロジック変更は禁止

### 2.3 完了済みタスク

`develop` のコミット履歴で以下の完了を確認済み。

- `T01`: `cac9a613` / `bb961224`
- `T02`: `1407418b` / `cd08344a`
- `T03`: `7f37b75c` / `ab103aad`
- `T06`: `94f653b0`
- `T11`: `bb5f0c25` / `24db9615`

---

## 3. 全エージェント共通ルール

- ベースブランチは `develop`
- 1 タスク 1 ブランチを厳守し、完了後はローカルの `develop` へマージする
- worktree は `/tmp` 配下に作成する
- ブランチ名は `feature/fe-reorg-<task-id>-<short-name>` 形式とする
- 作業開始前に担当範囲だけ確認し、不要な横展開修正はしない
- 変更後は、最低限そのタスク計画書に記載された確認を実施する
- commit は意味のある単位で 1 から 2 件にまとめる
- 作業完了後は以下の順で終了処理を行う
  - ローカルの `develop` へマージ
  - マージ完了後に worktree と作業ブランチを削除
  - 上記完了後に最終出力を行う
- 最終出力には必ず以下を含める
  - 概要
  - 変更理由
  - 影響範囲
  - 動作確認方法
  - DOC 更新有無
  - テスト結果
  - 全体カバレッジ結果
  - 規約例外の有無
  - 証跡
- 証跡には、実行コマンド、要点、結果を簡潔に記載する
- マージ後の `git status` で不要差分が残っていないことを確認する
- 作業ブランチ削除前に、`develop` へマージ済みであることを確認する

### 共通最終報告テンプレート

```markdown
## 証跡

### 実行コマンド
- `...`
- `...`

### 結果サマリ
- `...`
- `...`

### 補足
- `git diff --stat`: `...`
- `develop` へのマージ結果: `...`
- worktree / 作業ブランチ削除結果: `...`
- 未実施項目があれば理由を記載
```

---

## 4. エージェント別プロンプト

以下をそのまま各エージェントへ渡せる。

### Agent-T05

```text
あなたは FE 構成整理タスク T05 の担当エージェントです。担当は T05 のみです。他タスクへ手を広げないでください。

目的:
- `src/hooks.ts` の存在理由を明確にする
- 削除するか、正式採用して import を統一する

主対象:
- `FE/spa-next/my-next-app/src/hooks.ts`
- `FE/spa-next/my-next-app/src/` 配下の hooks import 箇所

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t05 -b feature/fe-reorg-t05-hooks-policy develop` を実行する
2. worktree に移動し、`src/hooks.ts` の参照有無を `rg` で確認する
3. 削除と正式採用のどちらが自然かを判断する
4. 採用する場合は import を統一し、削除する場合は不要参照が残らないように整理する
5. `rg` で再確認する
6. `git status` と `git diff --stat` を確認する
7. commit する
8. ローカルの `develop` へマージする
9. マージ完了後、worktree と作業ブランチを削除する
10. 証跡を添えて終了と出力を行う

完了条件:
- `src/hooks.ts` の存在理由が明確になっている
- import 方針が一貫している

最終出力に必ず含める証跡:
- 削除 / 正式採用 の判断理由
- 参照確認コマンドと要点
- import 統一を行った場合は対象一覧
- `git diff --stat`
```

### Agent-T04

```text
あなたは FE 構成整理タスク T04 の担当エージェントです。担当は T04 のみです。他タスクへ手を広げないでください。

目的:
- Jest 関連型定義を 1 系統に整理する

主対象:
- `FE/spa-next/my-next-app/types.d.ts`
- `FE/spa-next/my-next-app/jest.setup.ts`
- `FE/spa-next/my-next-app/tsconfig.jest.json`
- `FE/spa-next/my-next-app/src/tsconfig.jest.json`
- 必要に応じて関連 `.d.ts`

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t04 -b feature/fe-reorg-t04-jest-types-unify develop` を実行する
2. worktree に移動し、Jest 型定義まわりの重複箇所を確認する
3. どれを正とするか決め、重複設定を整理する
4. `npm run test` と `npx tsc -p tsconfig.jest.json --noEmit` を実行し、通ることを確認する
5. 実行できない場合は原因を切り分けて最終出力に残す
6. `git status` と `git diff --stat` を確認する
7. commit する
8. ローカルの `develop` へマージする
9. マージ完了後、worktree と作業ブランチを削除する
10. 証跡を添えて終了と出力を行う

完了条件:
- Jest 関連型定義が 1 系統に整理されている
- Jest テストと Jest 用 type check の整合が取れている

最終出力に必ず含める証跡:
- 整理前後の構成要約
- `npm run test` 結果
- `npx tsc -p tsconfig.jest.json --noEmit` 結果
- `git diff --stat`
```

### Agent-T07

```text
あなたは FE 構成整理タスク T07 の担当エージェントです。担当は T07 のみです。他タスクへ手を広げないでください。

目的:
- Storybook preview の二重定義を一本化する

主対象:
- `FE/spa-next/my-next-app/.storybook/preview.ts`
- `FE/spa-next/my-next-app/.storybook/preview.tsx`

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t07 -b feature/fe-reorg-t07-storybook-preview-unify develop` を実行する
2. worktree に移動し、`preview.ts` と `preview.tsx` の役割差分を確認する
3. どちらか 1 ファイルへ統合し、重複定義をなくす
4. `npm run build-storybook` を実行して build が通ることを確認する
5. 必要なら Storybook test 影響も確認する
6. `git status` と `git diff --stat` を確認する
7. commit する
8. ローカルの `develop` へマージする
9. マージ完了後、worktree と作業ブランチを削除する
10. 証跡を添えて終了と出力を行う

完了条件:
- Storybook preview 設定が 1 ファイルに整理されている
- Storybook build が通る

最終出力に必ず含める証跡:
- 統合方針の説明
- `npm run build-storybook` 結果
- 残した preview ファイル名
- `git diff --stat`
```

### Agent-T08

```text
あなたは FE 構成整理タスク T08 の担当エージェントです。担当は T08 のみです。他タスクへ手を広げないでください。

目的:
- `auth-mock-server/` の責務と置き場所を明確化する

主対象:
- `FE/spa-next/my-next-app/auth-mock-server/`
- 関連 README または補助資料

注意:
- 計画書では即削除禁止
- 用途確定を優先し、必要なら文書化中心で進める

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t08 -b feature/fe-reorg-t08-auth-mock-server-policy develop` を実行する
2. worktree に移動し、`auth-mock-server/` の利用箇所と README を確認する
3. 補助資材として分離するか、現配置維持のまま用途明記するかを判断する
4. 直ちに削除せず、責務・利用場面・保守方針が伝わる文書または README を整備する
5. `git status` と `git diff --stat` を確認する
6. commit する
7. ローカルの `develop` へマージする
8. マージ完了後、worktree と作業ブランチを削除する
9. 証跡を添えて終了と出力を行う

完了条件:
- `auth-mock-server/` の責務と置き場所の考え方が明確になっている

最終出力に必ず含める証跡:
- 用途調査結果
- 採用した方針と見送った案
- 更新した文書パス
- `git diff --stat`
```

### Agent-T09

```text
あなたは FE 構成整理タスク T09 の担当エージェントです。担当は T09 のみです。他タスクへ手を広げないでください。

目的:
- `analysis/` の保存方針を整理し、運用資材として残すのか生成物として別管理に寄せるのかを明文化する

主対象:
- `FE/spa-next/my-next-app/analysis/`
- `FE/spa-next/my-next-app/scripts/usage.md`
- `FE/spa-next/my-next-app/analysis/howToUse.md`

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t09 -b feature/fe-reorg-t09-analysis-policy develop` を実行する
2. worktree に移動し、`analysis/` 配下の内容と生成経路を確認する
3. `scripts/usage.md` と `analysis/howToUse.md` の整合を確認する
4. 保存方針を文書化する
5. 必要なら生成物扱い / 運用資材扱いの判断基準を追記する
6. `git status` と `git diff --stat` を確認する
7. commit する
8. ローカルの `develop` へマージする
9. マージ完了後、worktree と作業ブランチを削除する
10. 証跡を添えて終了と出力を行う

完了条件:
- `analysis/` の保存方針が明文化されている
- 利用手順文書間の整合が取れている

最終出力に必ず含める証跡:
- `analysis/` の役割整理
- `scripts/usage.md` と `analysis/howToUse.md` の確認結果
- 更新した文書パス
- `git diff --stat`
```

### Agent-T10

```text
あなたは FE 構成整理タスク T10 の担当エージェントです。担当は T10 のみです。他タスクへ手を広げないでください。

目的:
- `src/stories` 内のテンプレート由来サンプルを整理し、実プロダクト向け Storybook 構成へ近づける

主対象:
- `FE/spa-next/my-next-app/src/stories/`

作業手順:
1. `/home/oji/work/common-archetecture` から `git worktree add /tmp/common-archetecture-fe-t10 -b feature/fe-reorg-t10-storybook-samples-cleanup develop` を実行する
2. worktree に移動し、`src/stories` 配下のサンプルの役割を確認する
3. テンプレート由来で不要なサンプルを整理する
4. 残すサンプルと削除対象の役割を明確にする
5. Storybook 上で影響確認できるなら実施する
6. `git status` と `git diff --stat` を確認する
7. commit する
8. ローカルの `develop` へマージする
9. マージ完了後、worktree と作業ブランチを削除する
10. 証跡を添えて終了と出力を行う

完了条件:
- 実プロダクト向け Storybook 構成に近づいている
- 残すサンプルと削除対象の役割が説明可能になっている

最終出力に必ず含める証跡:
- 残置 / 削除の判断一覧
- Storybook 確認内容
- `git diff --stat`
```

---

## 5. 推奨実行順

同時実行する場合も、競合回避とマージ順の観点では次の順が無難。

1. T05, T04
2. T07
3. T08, T09, T10

---

## 6. 補足

- 各エージェントは、担当外のファイルが混入したら commit 前に除外を確認する
- 設定変更系タスクは、検証コマンド失敗時もそこで止めず、失敗内容を証跡として最終出力に残す
- 同一資料を複数タスクで更新しそうな場合は、計画書本体ではなくタスク固有の補助資料追加で衝突回避してよい
