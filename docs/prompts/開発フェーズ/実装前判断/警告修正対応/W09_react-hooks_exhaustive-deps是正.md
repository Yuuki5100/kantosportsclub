# W09 個別プロンプト

```text
あなたは警告修正タスク W09 の担当エージェントです。担当は W09 のみです。他タスクへ手を広げないでください。

目的:
- `react-hooks/exhaustive-deps` warning を安全に減らす
- warning を消すことだけを目的にせず、再描画・再フェッチ挙動の整合を取る

対象計画書:
- /home/oji/work/common-archetecture/docs/実行検証_警告修正計画_20260406.md

主対象:
- `FE/spa-next/my-next-app/src/pages/`
- `FE/spa-next/my-next-app/src/components/`
- `FE/spa-next/my-next-app/src/hooks/`

作業ブランチ:
- `task/w09-exhaustive-deps-fix`

worktree:
- `/tmp/common-archetecture-agent/w09-exhaustive-deps-fix`

必須作業:
1. `/home/oji/work/common-archetecture` の `develop` を起点に worktree を作成する
2. `react-hooks/exhaustive-deps` warning 発生箇所を確認する
3. 各 warning について、以下のどれで是正するかを判断する
   - 依存配列へ追加
   - 関数の責務分離
   - `useMemo` / `useCallback` / effect 構造の見直し
   - warning が誤検知に近い場合の最小限の許容
4. 依存追加で無限ループや再フェッチ増加が起きないことを確認する
5. 差分を確認する
6. 関連確認を実施する
   - 必須: `bash docker/stack.sh test-fe`
   - 必要に応じて対象コンポーネントや対象テストの個別確認
7. `react-hooks/exhaustive-deps` warning が減り、挙動が破綻していないことを確認する
8. コミットする
9. ローカル `develop` に `--no-ff` でマージする
10. マージ後、作業ブランチと worktree を削除する

確認観点:
- warning を無理に黙らせていない
- 再描画や再フェッチの挙動が不自然になっていない
- コメント disable を増やしすぎていない

コミットメッセージ例:
- `fix: W09 resolve exhaustive deps warnings`

コミット本文に必ず含める内容:
- `修正内容: react-hooks/exhaustive-deps warning を挙動確認付きで是正`
- `作業結果: test-fe と必要な個別確認を実施し、warning の変化を確認`

最終報告に必ず含める項目:
- タスクID
- 作業ブランチ
- worktree
- 修正ファイル
- 実施した確認コマンド
- `react-hooks/exhaustive-deps` warning の変化
- 挙動確認結果
- コミットID
- develop へのマージ結果
- branch / worktree の削除結果
```
