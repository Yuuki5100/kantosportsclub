# W02 個別プロンプト

```text
あなたは警告修正タスク W02 の担当エージェントです。担当は W02 のみです。他タスクへ手を広げないでください。

目的:
- `FE/spa-next/my-next-app/next.config.ts` に `allowedDevOrigins` を追加し、Docker ベース開発時の Next.js warning を抑止する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

作業ブランチ:
- `task/w02-allowed-dev-origins`

worktree:
- `/tmp/common-archetecture-agent/w02-allowed-dev-origins`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `FE/spa-next/my-next-app/next.config.ts` を確認する
3. 現在の Docker / Next.js dev 実行に適した `allowedDevOrigins` を追加する
4. 設定値は現行の Docker ベース開発に整合するようにする
5. 差分を確認する
6. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
   - 必須: FE 起動ログ確認
   - 必要に応じて: `bash docker/stack.sh e2e`
7. FE 起動ログで `allowedDevOrigins` 起因の warning が消えた、または狙い通り抑制されたことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- `next.config.ts` に無理のない設定で追加されている
- dev 実行に悪影響を出していない
- 起動ログの対象 warning が改善している

コミットメッセージ例:
- `fix: W02 add allowedDevOrigins for docker dev`

コミット本文に必ず含める内容:
- `修正内容: next.config.ts に allowedDevOrigins を追加`
- `作業結果: test-fe と frontend ログ確認を実施し、対象 warning の変化を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- 起動ログ確認結果
- warning 解消確認結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
