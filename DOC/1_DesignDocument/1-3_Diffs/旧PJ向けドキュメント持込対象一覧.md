# 旧PJ向けドキュメント持込対象一覧

## 1. 目的

本書は、旧PJへ現在のドキュメント管理体制を移行する際に、どの文書を持ち込み対象とするかを整理するための比較・移行資料である。

今回は「現PJの仕様を全面移植する」ことではなく、「現PJの文書管理体制を旧PJへ導入する」ことを主目的とする。

そのため、以下の 4 区分で扱う。

- `A: 必須持込` 現行の文書管理体制を成立させるために最初に持ち込む
- `B: 推奨持込` 運用を安定させるために早めに持ち込む
- `C: 条件付き持込` 技術スタックや運用が一致する場合のみ持ち込む
- `D: 初回持込対象外` 今回の管理体制移行では持ち込まない

---

## 2. 判定前提

- 旧PJへ持ち込む対象は、まず `DOC` 構造、規約、テンプレート、テスト運用資料を優先する
- 現PJの業務機能設計や個別機能の試験資料は、初回移行対象にしない
- 旧PJに同等の実装がある場合のみ、共通基盤設計や再利用資料を追加持込する
- 固有名詞、担当者名、ブランチ名、環境名は旧PJ向けに置換する前提で扱う

---

## 3. A: 必須持込

以下は、旧PJへ最初に持ち込む対象である。

| 現PJの文書 | 持込方法 | 旧PJでの扱い |
|-----------|----------|--------------|
| `DOC/README.md` | そのまま持込 | `DOC` 全体の入口として使用する |
| `DOC/2_DevGuides/2-2_Rules/開発ルール総則.md` | そのまま持込後、PJ固有名を調整 | 文書体系の親文書として使用する |
| `DOC/2_DevGuides/2-2_Rules/ドキュメント配置・仕分けルール.md` | そのまま持込 | 文書配置判断の正本として使用する |
| `DOC/2_DevGuides/2-2_Rules/文書オーナー一覧.md` | 雛形として持込 | 担当者・役割を旧PJ向けに差し替える |
| `DOC/2_DevGuides/2-2_Rules/規約レビュー運用.md` | そのまま持込後、承認経路を調整 | 文書レビューと変更承認の基本運用に使う |
| `DOC/2_DevGuides/2-2_Rules/規約例外申請テンプレート.md` | そのまま持込 | 例外管理テンプレートとして使う |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/00_目次/info.md` | そのまま持込 | BE 設計文書の分類基準として使う |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/README.md` | そのまま持込 | FE 設計文書の分類基準として使う |

補足:

- 旧PJの `DOC` が未整備なら、まず上記 8 文書を先に配置してから既存文書を仕分ける
- `文書オーナー一覧.md` はそのまま正本にせず、旧PJ体制に合わせて更新してから使う

---

## 4. B: 推奨持込

以下は、文書運用を安定化させるために早めに持ち込むことを推奨する。

### 4.1 規約・標準

| 現PJの文書 | 持込方法 | 条件 |
|-----------|----------|------|
| `DOC/2_DevGuides/2-2_Rules/命名規則.md` | 雛形として持込 | 命名方針を旧PJ実装に合わせて調整する |
| `DOC/2_DevGuides/2-2_Rules/バックエンドコーディング規約.md` | 雛形として持込 | 旧PJの BE 構成が大きく異ならないこと |
| `DOC/2_DevGuides/2-2_Rules/バックエンドデータアクセス標準.md` | 雛形として持込 | JPA/MyBatis 等の前提が近いこと |
| `DOC/2_DevGuides/2-2_Rules/フロントエンドコーディング規約.md` | 雛形として持込 | 旧PJの FE 構成が大きく異ならないこと |
| `DOC/2_DevGuides/2-2_Rules/規約検証マトリクス.md` | 雛形として持込 | 検証手段を旧PJ CI/レビューに合わせて更新する |

### 4.2 ブランチ・レビュー運用

| 現PJの文書 | 持込方法 | 条件 |
|-----------|----------|------|
| `DOC/2_DevGuides/2-2_Rules/標準ブランチ戦略-社内運用.md` | 雛形として持込 | 旧PJでも同系統のブランチ戦略を採用する場合 |
| `DOC/2_DevGuides/2-2_Rules/ブランチ保護・CI運用一覧.md` | 雛形として持込 | 保護対象や CI 名称を旧PJ向けに更新する |
| `DOC/2_DevGuides/2-2_Rules/brach4splint.md` | 条件付き雛形持込 | 旧PJでも `release-*` 拡張運用を使う場合のみ |
| `DOC/2_DevGuides/2-2_Rules/サブツリー運用のブランチ戦略追加.md` | 条件付き雛形持込 | Subtree 運用がある場合のみ |

### 4.3 設計書テンプレート

| 現PJの文書 | 持込方法 | 旧PJでの用途 |
|-----------|----------|--------------|
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/02_設定値/02_設定値テンプレート.md` | そのまま持込 | 設定値定義書の雛形 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/03_共通部品テンプレート.md` | そのまま持込 | 共通部品設計書の雛形 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/04_共通規約/04_共通規約テンプレート.md` | そのまま持込 | 共通規約書の雛形 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/05_個別機能/05_個別機能テンプレート.md` | そのまま持込 | 個別機能設計書の雛形 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/06_外部連携テンプレート.md` | そのまま持込 | 外部連携設計書の雛形 |

---

## 5. C: 条件付き持込

以下は、旧PJの実装や運用が現PJと近い場合のみ持ち込む。

### 5.1 開発環境・CI/CD

| 対象 | 持込条件 |
|------|----------|
| `DOC/2_DevGuides/2-1_HowToDevelop/*` | 旧PJでも WSL / Docker / devcontainer / 実行方式が近い場合 |
| `DOC/2_DevGuides/2-5_CiCd/*` | 旧PJでも同系統の CI/CD、カバレッジ、セキュリティ検査を使う場合 |
| `DOC/2_DevGuides/2-4_GitDocs/SVN2Git/*` | 旧PJで SVN 移行や authors 生成が必要な場合 |

### 5.2 テスト・QA運用

| 対象 | 持込条件 |
|------|----------|
| `DOC/3_TestQa/3-1_Testing/TEST_CREATION_GUIDE.md` | テストケース作成運用を標準化したい場合 |
| `DOC/3_TestQa/3-1_Testing/TEST_EVIDENCE_TEMPLATE.md` | 証跡テンプレートを統一したい場合 |
| `DOC/3_TestQa/3-1_Testing/PROMPT_TEST_SCENARIO_FROM_VIEWPOINTS.md` | agent/LLM を使った試験観点生成を行う場合 |
| `DOC/3_TestQa/3-1_Testing/USER_CHECKLIST.md` | UAT / 利用者確認手順を標準化したい場合 |
| `DOC/3_TestQa/3-1_Testing/IT-TEST-TOOLS.md` | 結合試験ツール運用が近い場合 |
| `DOC/3_TestQa/3-1_Testing/WSL_DOCKER_SETUP.md` | 旧PJでも同様のテスト環境を使う場合 |

### 5.3 共通基盤・再利用判断資料

| 対象 | 持込条件 |
|------|----------|
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/reuse/*` | 旧PJでも現PJの BE 共通基盤を再利用する場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/reuse/*` | 旧PJでも現PJの FE 共通基盤を再利用する場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/01_全体構成/*` | 同等のバックエンド基盤構成が旧PJにある場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/02_設定値/*` | 旧PJの設定体系が近く、定義書として再利用できる場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/03_共通部品/*` | 同一または近い共通部品が旧PJにも存在する場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/04_共通規約/*` | 認可・命名・共通設計ルールを旧PJへ拡張する場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/06_外部連携/*` | 同等の外部連携が旧PJにもある場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/07_例外処理/*` | エラーハンドリング方針を共通化する場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/BE/08_状態_コード定義/*` | 同じ状態管理・テーブル設計を使う場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/01_architecture/*` | FE 構成・Redux・i18n 方針が近い場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/02_application-foundation/*` | 認証、API、通知などの FE 基盤が共通化できる場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/03_realtime/*` | WebSocket 等のリアルタイム通信を使う場合 |
| `DOC/1_DesignDocument/1-1_BaseDocs/FE/modules/*` | 共通 UI 部品や機能コンポーネントを流用する場合 |

---

## 6. D: 初回持込対象外

以下は、今回の「文書管理体制移行」では持ち込まない。

### 6.1 現PJ固有の業務・機能設計

- `DOC/1_DesignDocument/1-1_BaseDocs/BE/05_個別機能/*`
  - ただし `05_個別機能テンプレート.md` を除く
- `DOC/1_DesignDocument/1-1_BaseDocs/FE/04_features/*`
- `DOC/1_DesignDocument/1-4_TestDesignDocs/BE/*`
- `DOC/3_TestQa/3-1_Testing/未実施の総合テストケース.md`
- `DOC/3_TestQa/3-1_Testing/未実施の(Tier1)結合テストケース.md`
- `DOC/3_TestQa/3-1_Testing/テスト観点表.csv`
- `DOC/2_DevGuides/2-3_DeveloperGuide/サーバー間通信概要.md`
- `DOC/2_DevGuides/2-3_DeveloperGuide/サーバー間通信作業内容.md`

### 6.2 調査・課題・計画メモ

- `DOC/1_DesignDocument/1-1_BaseDocs/BE/09_調査_課題/*`
- `DOC/2_DevGuides/2-2_Rules/規約統合論点整理.md`
- `DOC/2_DevGuides/2-1_HowToDevelop/ドッカー拡張計画.md`
- `DOC/2_DevGuides/2-1_HowToDevelop/changeVer.txt`
- `DOC/2_DevGuides/2-1_HowToDevelop/ドッカー追加予定リスト.txt`

### 6.3 廃止予定・持込不要

- `DOC/2_DevGuides/2-2_Rules/バックエンドファイル作成規約.md`

### 6.4 配置是正対象だが、管理体制移行の持込対象ではないもの

- `DOC/1_DesignDocument/1-1_BaseDocs/設定管理画面.md`
- `DOC/1_DesignDocument/1-1_BaseDocs/git-teamsLink.md`

補足:

- 上記 2 文書は内容上は設計書だが、現行ルールでは `1-1_BaseDocs` 直下に置くべきではない
- 旧PJへ持ち込む前に、必要なら適切なカテゴリへ再配置したうえで個別判断する

---

## 7. 旧PJへの持込順序

推奨順序は以下とする。

1. `A: 必須持込` を旧PJへ配置する
2. 旧PJ側の既存 `DOC` を新ルールで仕分けし直す
3. 旧PJの体制に合わせて `文書オーナー一覧.md`、ブランチ運用、命名規則を更新する
4. 必要に応じて `B: 推奨持込` を追加する
5. 実装差分を確認し、適合するものだけ `C: 条件付き持込` を追加する

---

## 8. agent への指示で必ず含めること

- `A: 必須持込` は自動で持ち込んでよい
- `B: 推奨持込` は旧PJに合わせた調整前提で持ち込む
- `C: 条件付き持込` は実装一致確認後のみ持ち込む
- `D: 初回持込対象外` は持ち込まない
- 迷う文書は移動せず、`要確認` 一覧へ記録する
