# W07 個別プロンプト

```text
あなたは警告修正タスク W07 の担当エージェントです。担当は W07 のみです。他タスクへ手を広げないでください。

目的:
- FE 全体の `@typescript-eslint/no-unused-vars` warning を低リスクに整理する
- 未使用 import / 変数 / 引数を削除し、意図的な未使用引数は `_` 接頭辞へ統一する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/`
- 必要に応じて `FE/spa-next/my-next-app/scripts/`

作業ブランチ:
- `task/w07-no-unused-vars-cleanup`

worktree:
- `/tmp/common-archetecture-agent/w07-no-unused-vars-cleanup`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `no-unused-vars` warning 発生箇所を確認する
3. 低リスクなものから整理する
   - 未使用 import の削除
   - 未使用ローカル変数の削除
   - 意図的な未使用引数の `_` 接頭辞化
4. 業務ロジック変更につながる削除は避け、非自明なものは触らない
5. 差分を確認する
6. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
7. `no-unused-vars` warning が目に見えて減ったことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- 未使用物の削除が安全な範囲に留まっている
- 余計な仕様変更を起こしていない
- `no-unused-vars` warning が減っている

コミットメッセージ例:
- `refactor: W07 clean up unused vars warnings`

コミット本文に必ず含める内容:
- `修正内容: FE 全体の no-unused-vars warning を低リスク範囲で整理`
- `作業結果: test-fe を実行し、unused-vars warning の減少を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- `no-unused-vars` warning の変化
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
