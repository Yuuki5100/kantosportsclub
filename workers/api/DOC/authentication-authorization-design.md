# workers/api 認証・認可設計（実装追従版）

最終更新: 2026-06-29

※本ファイルは現行実装に合わせた補足メモです。

---

## SecurityConfig 相当の考え方（重要補足）

Spring Boot の SecurityConfig に相当するものは Workers/Hono には存在しない。

その代わりに以下で構成する：

- index.ts → SecurityConfig 相当
- middleware/authRequired.ts → 認証前段
- middleware/permissionRequired.ts → 権限判定

```ts
const app = new Hono();

app.use('/api/*', authRequired);
app.use('/api/*', permissionRequired);

app.route('/api/auth', auth); // middleware 側で /api/auth 配下は除外
```

---

## middleware の責務

### authRequired.ts
- `endpoint_authority_mapping` を参照して、該当エンドポイントの権限定義を引く
- 権限定義が見つからない場合は 403
- `required_level = 0` の場合は accessToken なしでも通す
- `required_level > 0` の場合は accessToken を検証する
- accessToken がない、または無効な場合は 401
- 認証結果は `c.set("auth", ...)` で後段へ渡す

### permissionRequired.ts
- `endpoint_authority_mapping` を参照して権限定義を引く
- 権限定義が見つからない場合は 403
- `required_level = 0` は無条件で通過
- `required_level > 0` は `c.get("auth")` の `roleLevel` と比較する
- 権限不足の場合は 403

---

## 現行の認証フロー

実装上の流れは次の通り。

1. `authRequired` が `endpoint_authority_mapping` を参照する
2. `required_level = 0` なら認証なしで通過する
3. `required_level > 0` なら accessToken を検証する
4. `permissionRequired` が同じく `endpoint_authority_mapping` を参照する
5. `required_level = 0` なら通過する
6. `required_level > 0` なら `auth.roleLevel` で権限判定する

`authRequired` と `permissionRequired` はどちらも `endpoint_authority_mapping` を見るが、前者は認証の成立確認、後者は権限レベル判定を担う。

---

## パスワードハッシュ方針（Workers cost 削減）

Workers/API では、サーバー負荷を抑えるため bcrypt cost を下げる方向ではなく、Workers 向きに Web Crypto の `PBKDF2-SHA256` へ移行する。

新規・移行後のハッシュ形式:

```text
pbkdf2-sha256$10000$salt$hash
```

移行方針:

- `workers/api/src/auth/passwordHash.ts` で PBKDF2-SHA256 の生成・検証を行う。
- 旧 bcrypt ハッシュも検証可能にして、既存ユーザーのログインを壊さない。
- `workers/api/src/service/authService.ts` で、旧 bcrypt のログイン成功時に PBKDF2 へ自動再ハッシュする。
- `workers/api/src/repositories/authRepository.ts` で `users.password` の更新処理を持つ。
- `workers/api/migrations/0010_auth_password_pbkdf2.sql` で、既定 seed の `admin/user/viewer` だけ、既知の bcrypt cost 12 ハッシュなら PBKDF2 に置換する。

既存ユーザーの平文パスワードは取得できないため、全ユーザーの一括再生成は行わない。ログイン成功時の段階的移行を正とする。

---

## Cookie 属性の環境別切り替え

認証 Cookie は、ローカルと本番で属性を切り替える。

切り替え方針:

- `workers/api/wrangler.toml` の `COOKIE_SECURE` を使う。
- `COOKIE_SECURE=true` のときは `SameSite=None; Secure` にする。
- `COOKIE_SECURE=false` のときは `SameSite=Lax; Secureなし` にする。
- `workers/api/src/routes/auth.ts` で `c.env.COOKIE_SECURE` を見て `setCookie` / `deleteCookie` の属性を切り替える。

運用上の意味:

- 本番相当では cross-site のフロント `https://kantosportsclub.pages.dev` から `workers.dev` へ Cookie を送るため、`SameSite=None; Secure` が必要。
- ローカルでは `http://localhost` で確認しやすいように `Secure` を外す。
- `workers/api/package.json` の `dev` は `wrangler dev --local --env local` を使い、ローカルでは `COOKIE_SECURE=false` を読む。

---

## 設計上の対応関係

| Spring | Workers |
|------|--------|
| SecurityConfig | index.ts |
| Filter Chain | middleware |
| @RequirePermission | endpoint_authority_mapping |

`endpoint_authority_mapping.required_level` は次の意味で扱う。

- `0`: public / 認証不要
- `1`: 参照
- `2`: 更新
- `3`: 管理

public endpoint も手書きの分岐ではなく `required_level = 0` で管理する。

`user_role_permissions` はログイン後に返すユーザー権限情報の元データとして使う。  
`auth` の `status` 返却では `permissionId / permissionName / statusLevelId` の配列として利用される。  
`permissionRequired` の実行時判定は、`endpoint_authority_mapping.required_level` と `auth.roleLevel` の比較が中心で、`user_role_permissions` そのものは直接比較しない。

---

## 既存設計との統合ポイント

- routes は controller のまま
- service は認証・トークン・権限の中核ロジック
- repository はDB
- middleware が横断的制御

---

## まとめ（補足込み）

Workersでは以下が中核：

```text
index.ts
  + middleware/*
```

これが SecurityConfig の代替となる。
