# W06 個別プロンプト

```text
あなたは警告修正タスク W06 の担当エージェントです。担当は W06 のみです。他タスクへ手を広げないでください。

目的:
- 現在の FE ESLint warning をカテゴリ別に棚卸しする
- W07 / W08 / W09 / W10 へ安全に分割できる形へ整理する
- 低リスクに減らせる warning があれば、棚卸し範囲内で小さく解消する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/`
- `docs/実行検証_警告修正計画_20260406.md`

作業ブランチ:
- `task/w06-eslint-warning-inventory`

worktree:
- `/tmp/common-archetecture-agent/w06-eslint-warning-inventory`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `bash docker/stack.sh test-fe` を実行し、最新の warning 総数と代表カテゴリを確認する
3. warning を少なくとも以下の観点で分類する
   - `@typescript-eslint/no-unused-vars`
   - `@typescript-eslint/no-explicit-any`
   - `react-hooks/exhaustive-deps`
   - `@next/next/no-img-element`
   - その他
4. ファイル数、代表ファイル、着手優先度を整理する
5. 計画書または補助ドキュメントへ、分類結果と推奨着手順を反映する
6. 棚卸しの副産物として低リスクな warning を少数解消してもよいが、W07 / W08 / W09 の本作業を先食いしない
7. 差分を確認する
8. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
9. warning 棚卸し結果が再利用可能な形で残っていることを確認する
10. コミットする
11. ローカル `develop` に `--no-ff` でマージする
12. マージ後、作業ブランチと worktree を削除する

確認観点:
- warning の内訳が実作業に使える粒度で整理されている
- 件数だけでなく代表ファイルと優先度が分かる
- W07 / W08 / W09 / W10 の作業境界が明確になっている

コミットメッセージ例:
- `docs: W06 inventory frontend eslint warnings`

コミット本文に必ず含める内容:
- `修正内容: FE ESLint warning をカテゴリ別に棚卸しし、着手順を整理`
- `作業結果: test-fe を実行し、warning 総数と代表カテゴリを確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- warning 件数とカテゴリ別整理結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
