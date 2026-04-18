# REST API命名・認可キー規約

## 1. 目的
REST APIパスと認可キーの表現を統一し、DB正本と実装の不一致を防ぐ。

## 2. 適用範囲
- APIパス命名
- HTTPメソッドの使い分け
- `endpoint_authority_mapping` の認可キー表記
- Method Security式のエンドポイント表現

## 3. 認可キー規約
- 正式キー形式: `"METHOD /path"`
- 例: `GET /api/user/list`, `PUT /api/admin/user/permissions`
- `endpoint_authority_mapping(method,url)` はこの形式へ変換して扱う

## 4. パス命名規約
- 基本: `/api/{domain}/{resource}`
- 一覧: `GET`
- 詳細: `GET /{id}`
- 更新: `PUT` または `PATCH`
- 削除: `DELETE`
- 作成/処理起動: `POST`

## 5. Method Security記述規約
- 推奨: `"METHOD /path"` を明示する
- 互換: `"/path"` 省略記法は許容（methodは `security.permission.method-security-default-method` で補完）

## 6. ワイルドカード規約
- パターンは `AntPathMatcher` 互換とする
- 例: `GET /api/user/**`

## 7. NG例
| NG | 理由 | 修正 |
| --- | --- | --- |
| `POST /getUserList` | パスに動詞、メソッド不一致 | `GET /api/user/list` |
| `get /api/user/list` | METHOD大文字規約違反 | `GET /api/user/list` |
| `@PreAuthorize("... '/api/user/list' ...")` を無秩序に多用 | method解釈が不明瞭 | `"GET /api/user/list"` を明示 |
