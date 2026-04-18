# 旧PJドキュメント仕分けエージェント実行プロンプト

以下は、旧PJへ現在のドキュメント管理体制を移行するために agent へ渡す実行プロンプトである。

---

## 1. コピーペースト用プロンプト

```text
あなたは旧PJの DOC 移行担当 agent です。

作業対象:
- 現PJ: /home/oji/work/common-archetecture
- 旧PJ: <OLD_PROJECT_ROOT>

目的:
旧PJに対して、現PJの「ドキュメント管理体制」を導入してください。
今回は現PJの全設計書を丸ごと移植するのではなく、文書構造・配置ルール・運用ルール・必要テンプレートを導入し、そのルールで旧PJの既存文書を仕分けることが目的です。

必ず最初に読む文書:
- /home/oji/work/common-archetecture/DOC/README.md
- /home/oji/work/common-archetecture/DOC/2_DevGuides/2-2_Rules/開発ルール総則.md
- /home/oji/work/common-archetecture/DOC/2_DevGuides/2-2_Rules/ドキュメント配置・仕分けルール.md
- /home/oji/work/common-archetecture/DOC/1_DesignDocument/1-3_Diffs/旧PJ向けドキュメント持込対象一覧.md
- 必要に応じて:
  - /home/oji/work/common-archetecture/DOC/1_DesignDocument/1-1_BaseDocs/BE/00_目次/info.md
  - /home/oji/work/common-archetecture/DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md

基本ルール:
1. 文書タイトルではなく「主目的」で分類すること
2. 1文書1責務を原則とし、混在文書は分割候補として扱うこと
3. 不明な文書は推測で移動しないこと
4. A: 必須持込 は自動で持ち込んでよい
5. B: 推奨持込 は旧PJ向けに調整前提で持ち込むこと
6. C: 条件付き持込 は旧PJの実装や運用が一致する場合のみ持ち込むこと
7. D: 初回持込対象外 は持ち込まないこと
8. 旧PJの既存文書は無断削除せず、必要なら移動・改名・分割候補として扱うこと
9. `rename.md` `tmp.md` `draft.md` のような仮名称は正式名称候補を提示すること

実行タスク:
1. 旧PJに `DOC` 配下がなければ、現PJの構成に合わせて必要ディレクトリを作成する
2. 現PJの「A: 必須持込」文書を旧PJへ同じ相対パスで持ち込む
3. 旧PJの体制に合わせて、少なくとも以下は調整対象として扱う
   - 文書オーナー一覧
   - ブランチ名
   - 承認者・問い合わせ先
   - 環境名、サーバー名、PJ 固有名
4. 旧PJに既存で存在するドキュメントをすべて棚卸しし、`ドキュメント配置・仕分けルール.md` に従って配置先を判定する
5. 仕分け結果に基づき、旧PJ側の文書を適切なパスへ移動または整理する
6. 旧PJ文書のうち、以下に該当するものは自動移動せず `要確認` とする
   - 設計書と手順書が 1 文書に混在している
   - BE と FE が同等比重で混在している
   - 正本か調査メモか判別できない
   - 旧PJ固有の業務文書だが、どのカテゴリに置くべきか曖昧
7. `B: 推奨持込` のうち、旧PJに必要なものを持ち込み候補として整理する
8. `C: 条件付き持込` は、旧PJの実装や運用が一致する場合のみ候補に入れる
9. `D: 初回持込対象外` は持ち込まない

旧PJ側で作成・更新する成果物:
- DOC/README.md
- DOC/2_DevGuides/2-2_Rules/開発ルール総則.md
- DOC/2_DevGuides/2-2_Rules/ドキュメント配置・仕分けルール.md
- DOC/2_DevGuides/2-2_Rules/文書オーナー一覧.md
- DOC/1_DesignDocument/1-3_Diffs/旧PJ_DOC仕分け結果.md
- DOC/1_DesignDocument/1-3_Diffs/旧PJ_要確認文書一覧.md
- 必要に応じて、各カテゴリへ再配置した旧PJ文書

`旧PJ_DOC仕分け結果.md` には最低限以下を記載すること:
- 旧PJの元文書パス
- 判定した主目的
- 新しい配置先
- 実施内容（移動 / 改名 / 分割候補 / 据え置き）
- 判断理由
- 現PJから持ち込んだ関連文書があればそのパス

`旧PJ_要確認文書一覧.md` には最低限以下を記載すること:
- 文書パス
- 迷った理由
- 候補配置先
- 追加で必要な確認事項

判断基準:
- 設計・仕様・定義は `DOC/1_DesignDocument`
- 開発手順・規約・実装ガイド・CI/CD は `DOC/2_DevGuides`
- テスト実施・証跡・チェックリストは `DOC/3_TestQa`
- 比較・移行・差分判断は `DOC/1_DesignDocument/1-3_Diffs`
- 設計起点のテスト設計は `DOC/1_DesignDocument/1-4_TestDesignDocs`
- BE の分類は `BE/00_目次/info.md`
- FE の分類は `FE/README.md`

禁止事項:
- 現PJの個別機能設計を無条件で旧PJへコピーしないこと
- 旧PJ固有文書を内容確認なしに削除しないこと
- 判別不能な文書を推測だけで正本にしないこと
- D: 初回持込対象外 の文書を持ち込まないこと

最終報告では以下を簡潔にまとめること:
- 持ち込んだ文書
- 仕分けた旧PJ文書数
- 要確認文書数
- 条件付き持込として保留した文書
- 次に人が判断すべき事項
```

---

## 2. 使い方メモ

- `<OLD_PROJECT_ROOT>` だけ旧PJの実パスに置き換えて使う
- 旧PJに `1-3_Diffs` が無い場合は agent に作成させてよい
- 初回は `A: 必須持込` と旧PJ既存文書の再仕分けまでをスコープにするのが安全
- `B` と `C` まで一気にやる場合は、旧PJの実装差分確認を先に入れる
