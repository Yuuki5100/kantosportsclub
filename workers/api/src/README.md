# authService 実装ファイル

## 配置

zip 内のファイルは以下の配置を想定しています。

```text
workers/api/src/
├── service/
│   └── authService.ts
├── function/
│   └── authToken.ts
├── types/
│   └── types.auth-example.ts
└── repositories/
    └── authRepository.contract.ts
```

## 注意

- `types.auth-example.ts` は、既存の `types/types.ts` に不足がある場合だけ反映してください。
- `authRepository.contract.ts` は実装ではなく、`authService.ts` が期待する repository interface のメモです。
- 実DBアクセスは既存の `repositories/authRepository.ts` に実装してください。
- refresh token は JWT ではなく opaque token として扱い、D1 の `auth_refresh_token.token_hash` で検証します。
- access token は HS256 JWT として実装しています。
