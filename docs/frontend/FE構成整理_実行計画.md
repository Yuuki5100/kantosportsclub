# FE構成整理 実行計画

## 1. 目的

`FE/` 配下のフォルダおよびファイル構成について、現行動作を維持したまま統合・整理できる対象を段階的に解消する。

本計画は、以下を実現することを目的とする。

- 未使用物、孤立物、生成物混入を削減する
- FE 配下の責務を明確化する
- Docker / CI / 開発手順に依存する本体配置を保護する
- 低リスクな整理から着手し、段階的に保守性を上げる

---

## 2. 前提

- `FE/spa-next/my-next-app` は現行フロントエンド本体である
- `frontend/Dockerfile`、`docker/compose.yml`、`docker/stack.sh`、`.gitlab-ci.yml`、`CI/ci-config/common.yml`、`CI/ci-config/frontend.yml`、`DOC/2_DevGuides/2-1_HowToDevelop/開発環境.md` は `FE/spa-next/my-next-app` を前提に参照している
- 上記参照を一括更新して Docker / CI / 開発手順の再検証を行う専用タスクを切らない限り、`FE/spa-next/my-next-app` は移設対象外とし、構成整理タスクでは本体移設を行わない
- 本計画では「構成整理」を対象とし、画面仕様や業務ロジック変更は対象外とする

---

## 3. 対象範囲

- `FE/`
- `frontend/`
- `docker/`
- `CI/`
- `DOC/2_DevGuides/2-1_HowToDevelop`
- `docs/` 配下の関連補助資料

---

## 4. 実行方針

- まず低リスクな削除・除外・統合から着手する
- 本体移設を伴う整理は行わない
- Storybook / Jest / Playwright など設定影響のある変更は単独タスクとして分離する
- 生成物の混入除去と不要資材整理を優先する
- 中リスク以上の変更は、設定修正と確認作業を 1 セットで扱う

---

## 5. タスク一覧

| ID | 優先度 | タスク | 内容 | 実行難易度 | 影響範囲 | 実行リスク | 完了条件 |
|----|--------|--------|------|------------|----------|------------|----------|
| T01 | 高 | 孤立 lockfile 削除 | `FE/package-lock.json` を削除する | 低 | `FE/` 直下 | 低 | ルート FE 直下に実体のない lockfile が存在しない |
| T02 | 高 | 休眠 Cypress 資材整理 | `cypress/` と `cypress.config.ts` を削除または退避する | 低 | FE テスト資材 | 低 | Playwright 運用に一本化され、休眠 Cypress が残らない |
| T03 | 高 | 未使用テンプレート資材整理 | `src/App.css`、`src/index.css`、`src/assets/react.svg`、`public` 配下の未使用テンプレート SVG、`robot.txt` を整理する | 低 | FE 静的資材 | 低 | 未参照テンプレート残骸が除去される |
| T04 | 高 | Jest 型定義統合 | `types.d.ts`、`.d.ts`、`jest.setup.ts`、`src/tsconfig.jest.json` の重複を整理する | 中 | Jest、型解決 | 中 | Jest 関連型定義が 1 系統に整理される |
| T05 | 中 | 未参照 Redux hooks 方針決定 | `src/hooks.ts` を削除するか、正式採用して import を統一する | 低 | Redux hooks 利用箇所 | 低 | `src/hooks.ts` の存在理由が明確になる |
| T06 | 高 | 生成物の Git 管理解消 | `dist/output.css` と `tmp/pw-output*/.last-run.json` を追跡対象から外し、`.gitignore` を整備する | 低 | Git 差分、CI 差分 | 低 | 生成物が通常差分に混入しない |
| T07 | 中 | Storybook preview 一本化 | `.storybook/preview.ts` と `.storybook/preview.tsx` の二重定義を統合する | 中 | Storybook、Storybook test | 中 | Storybook preview 設定が 1 ファイルに整理される |
| T08 | 低 | Auth mock server 配置整理 | `auth-mock-server/` を補助資材として分離するか、用途を明記する | 中 | ローカル開発補助 | 中 | `auth-mock-server/` の責務と置き場所が明確になる |
| T09 | 低 | analysis 出力物方針整理 | `analysis/` を運用資材として維持するか、生成物として別管理に寄せるか決める | 中 | 分析スクリプト、補助資料 | 中 | `analysis/` の保存方針が明文化される |
| T10 | 低 | Storybook 初期サンプル整理 | `src/stories` 内のテンプレート由来サンプルを整理する | 中 | Storybook UI、補助サンプル | 低 | 実プロダクト向け Storybook 構成に近づく |
| T11 | 高 | 本体固定パス前提の明文化 | `FE/spa-next/my-next-app` を移設対象外とする方針を資料化する | 低 | Docker、CI、開発手順 | 低 | 本体移設を避ける判断基準が明記される |

---

## 6. 優先順位の判断基準

優先度「高」とする条件:

- 現行動作を維持したまま着手しやすい
- 差分ノイズ削減効果が高い
- 不要物や休眠資材の除去につながる

優先度「中」とする条件:

- 設定や型解決に関わる
- 実施後にテストまたはビルド確認が必要

優先度「低」とする条件:

- 補助資材の整理であり、直近の動作保証には影響しない
- 用途定義や保管方針の決定が主目的である

---

## 7. 実行フェーズ

### フェーズ1: 即時整理

- T11 本体固定パス前提の明文化
- T01 孤立 lockfile 削除
- T06 生成物の Git 管理解消
- T03 未使用テンプレート資材整理

完了条件:

- 不要な孤立ファイル、未使用テンプレート、生成物混入が減っている
- 本体移設を行わない方針が明示されている

### フェーズ2: 低リスク構成整理

- T02 休眠 Cypress 資材整理
- T05 未参照 Redux hooks 方針決定
- T04 Jest 型定義統合

完了条件:

- 使っていないテスト基盤が残っていない
- 型定義と hooks の責務が整理されている

### フェーズ3: 設定統合

- T07 Storybook preview 一本化

完了条件:

- Storybook 設定の重複が解消されている
- Storybook build が通る

### フェーズ4: 補助資材再編

- T08 Auth mock server 配置整理
- T09 analysis 出力物方針整理
- T10 Storybook 初期サンプル整理

完了条件:

- 補助資材の責務と保存方針が明確になっている

---

## 8. 推奨実行順

1. T11 本体固定パス前提の明文化
2. T01 孤立 lockfile 削除
3. T06 生成物の Git 管理解消
4. T03 未使用テンプレート資材整理
5. T02 休眠 Cypress 資材整理
6. T05 未参照 Redux hooks 方針決定
7. T04 Jest 型定義統合
8. T07 Storybook preview 一本化
9. T08 Auth mock server 配置整理
10. T09 analysis 出力物方針整理
11. T10 Storybook 初期サンプル整理

---

## 9. タスク別の確認方法

| タスク | 主な確認方法 |
|--------|--------------|
| T01 | `git status` で不要差分が増えないことを確認 |
| T02 | `npm run test:it` に影響がないこと、Cypress 参照が残っていないことを確認 |
| T03 | `rg` で参照が残っていないことを確認 |
| T04 | `npm run test` と `npx tsc -p tsconfig.jest.json --noEmit` を確認 |
| T05 | `rg` で import 有無を確認し、採用時は import を統一 |
| T06 | `git status` で生成物差分が通常運用で混入しないことを確認 |
| T07 | `npm run build-storybook` を確認 |
| T08 | README または補助資料に用途を明記 |
| T09 | `scripts/usage.md` と `analysis/howToUse.md` の整合を確認 |
| T10 | Storybook 上で残すサンプルと削除対象の役割を定義 |
| T11 | Docker / CI / 開発手順に本体固定パス前提を明記 |

---

## 10. 実行リスクと対処方針

- 本体パス変更は Docker / CI / 開発手順に連鎖影響があり、参照更新と再検証を伴う別タスクになるため、本計画では実施しない
- `Logo.png` は利用中のため整理対象に含めない
- `analysis/` と `auth-mock-server/` は即削除せず、用途確定後に処理する
- Storybook と Jest の設定変更は、単独差分でレビュー可能な形に分割する

---

## 11. 完了判定

本計画の完了は、以下をすべて満たした時点とする。

- `FE/` 配下の孤立ファイル、休眠資材、未使用テンプレート資材が整理されている
- 生成物が通常の Git 差分に混入しない
- Jest / Storybook の設定重複が解消されている
- `auth-mock-server/`、`analysis/`、`src/stories` の扱いが明文化されている
- `FE/spa-next/my-next-app` を移設対象外とする運用判断が共有されている

---

## 12. 備考

- 本計画は 2026-04-06 時点の構成監査結果に基づく
- 実装着手時は、各フェーズを可能な限り個別 PR / 個別コミットに分ける
