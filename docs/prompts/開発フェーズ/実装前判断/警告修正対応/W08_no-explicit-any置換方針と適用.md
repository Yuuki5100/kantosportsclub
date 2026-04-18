# W08 個別プロンプト

```text
あなたは警告修正タスク W08 の担当エージェントです。担当は W08 のみです。他タスクへ手を広げないでください。

目的:
- `@typescript-eslint/no-explicit-any` warning のうち、主要領域を安全に減らす
- `unknown`、明示型、共通型 alias のいずれが適切かを判断して置換する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/api/`
- `FE/spa-next/my-next-app/src/hooks/`
- `FE/spa-next/my-next-app/src/mocks/`
- `FE/spa-next/my-next-app/src/tests/`
- `FE/spa-next/my-next-app/src/utils/`

作業ブランチ:
- `task/w08-no-explicit-any-reduction`

worktree:
- `/tmp/common-archetecture-agent/w08-no-explicit-any-reduction`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `no-explicit-any` warning 発生箇所を確認する
3. 置換方針を決める
   - 受け口不明な入力は `unknown`
   - 構造が分かるものは明示型
   - 再利用される形は共通型 alias
4. 型安全性を下げる `as any` 逃げは増やさない
5. 変更範囲を主要領域に絞り、横展開しすぎない
6. 差分を確認する
7. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
8. `no-explicit-any` warning が減ったことを確認する
9. コミットする
10. ローカル `develop` に `--no-ff` でマージする
11. マージ後、作業ブランチと worktree を削除する

確認観点:
- 置換理由が説明できる
- 型チェックやテストを壊していない
- `any` を別の曖昧さへ置き換えていない

コミットメッセージ例:
- `refactor: W08 reduce explicit any warnings`

コミット本文に必ず含める内容:
- `修正内容: no-explicit-any warning を主要領域で置換し、型方針を整理`
- `作業結果: test-fe を実行し、explicit-any warning の変化を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- `no-explicit-any` warning の変化
- 置換方針の要約
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
