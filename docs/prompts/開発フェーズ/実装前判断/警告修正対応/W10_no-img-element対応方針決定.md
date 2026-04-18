# W10 個別プロンプト

```text
あなたは警告修正タスク W10 の担当エージェントです。担当は W10 のみです。他タスクへ手を広げないでください。

目的:
- `@next/next/no-img-element` warning の扱い方針を決める
- `next/image` へ移行するのか、意図的に許容するのかを明文化し、今後の判断基準を統一する

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/pages/login/index.tsx`
- `FE/spa-next/my-next-app/eslint.config.mjs`
- 必要に応じて補助ドキュメント

作業ブランチ:
- `task/w10-no-img-element-policy`

worktree:
- `/tmp/common-archetecture-agent/w10-no-img-element-policy`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. 現在の `no-img-element` warning 発生箇所を確認する
3. その箇所が `next/image` へ安全に移行できるか、または意図的許容が妥当かを判断する
4. 方針を文書化する
   - 対象箇所
   - 採用方針
   - 採用理由
   - 今後の横展開ルール
5. 方針決定だけで足りる場合は、不要にコード変更しない
6. もしその場で安全に 1 箇所だけ直せるなら最小修正で実施してもよい
7. 差分を確認する
8. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
9. `no-img-element` の扱いがチームで再利用できる形で残っていることを確認する
10. コミットする
11. ローカル `develop` に `--no-ff` でマージする
12. マージ後、作業ブランチと worktree を削除する

確認観点:
- 方針が具体的で、次回以降に迷いにくい
- 方針決定タスクの範囲を超えて広範囲な UI 変更をしていない
- 実装した場合は warning の変化が確認できる

コミットメッセージ例:
- `docs: W10 decide no-img-element handling policy`

コミット本文に必ず含める内容:
- `修正内容: no-img-element warning の対応方針を整理し、必要最小限の反映を実施`
- `作業結果: test-fe を実行し、warning の扱い方と影響範囲を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- `no-img-element` の方針決定結果
- warning の変化または未変更理由
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
