# Newman 実行ファイル

`docker/stack.sh newman` / `newman-smoke`（GitLab CI）で実行する
Collection / Environment を配置します。

## 既定ファイル

- Collection: `smoke.postman_collection.json`
- Environment: `local.postman_environment.json`（任意）

## 認証トークン取得フロー

`smoke.postman_collection.json` は以下の順で実行されます。

1. `Auth Login` で `POST {{authLoginPath}}` を実行
2. `Set-Cookie` の `{{authTokenCookieName}}` を抽出して `authToken` へ保存
3. 後続リクエストで `Authorization: Bearer {{authToken}}` を付与

必要な変数:

- `baseUrl`
- `loginUserId`
- `loginPassword`
- `loginUserIdKey`（既定: `user_id`）
- `loginPasswordKey`（既定: `password`）
- `authLoginPath`（既定: `/api/auth/login`）
- `authStatusPath`（既定: `/api/auth/status`）
- `authTokenCookieName`（既定: `ACCESS_TOKEN`）

## 実行例

```bash
NEWMAN_BASE_URL=http://gateway:8888 \
NEWMAN_LOGIN_USER_ID=<user_id> \
NEWMAN_LOGIN_PASSWORD=<password> \
docker/stack.sh newman
```

Environment を指定する場合:

```bash
NEWMAN_BASE_URL=http://gateway:8888 \
NEWMAN_LOGIN_USER_ID=<user_id> \
NEWMAN_LOGIN_PASSWORD=<password> \
NEWMAN_AUTH_LOGIN_USER_ID_KEY=user_id \
NEWMAN_AUTH_LOGIN_PASSWORD_KEY=password \
NEWMAN_AUTH_LOGIN_PATH=/api/auth/login \
NEWMAN_AUTH_STATUS_PATH=/api/auth/status \
NEWMAN_AUTH_TOKEN_COOKIE_NAME=ACCESS_TOKEN \
NEWMAN_ENVIRONMENT=/etc/newman/local.postman_environment.json \
docker/stack.sh newman
```
