## Auth Mock Server

`auth-mock-server/` is a standalone Express server used only as a local development aid.
It exists to simulate authentication, session cookie handling, and simple permission checks
without starting the full backend.

## Responsibility

This directory is kept for the following limited use cases:

- Manual verification of login/logout and session cookie behavior.
- Local reproduction of simple auth and authorization flows during frontend development.
- Quick checks of proxy/CORS behavior between Next.js (`localhost:3000`) and a separate auth server (`localhost:3005`).

This directory is not the primary mock implementation for the frontend application.
The standard frontend mock path is `NEXT_PUBLIC_USE_MOCK_MODE=true` together with
[`src/mocks/`](../src/mocks), which is used by the application code itself.

## Why It Stays Here

`auth-mock-server/` is colocated under `my-next-app/` because its endpoint contract is tightly
coupled to this frontend's auth-related requests and local development assumptions.
For now, keeping it near the app makes its ownership clear and keeps the helper available
without introducing a separate package or repository.

This placement should be reconsidered only if one of the following becomes true:

- The same helper is reused by multiple frontend apps.
- It becomes part of CI or a supported shared developer toolchain.
- The implementation needs versioning independent from `my-next-app`.

## Current Scope

The current TypeScript entry point is [`index.ts`](./index.ts), started by `npm run dev`.
It serves a small set of local-only endpoints such as:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/status`
- `GET /user/profile`
- `PUT /user/update`
- `PUT /admin/user/permissions`
- `GET /user/list`

The server listens on `http://localhost:3005` and allows requests from local frontend origins.

## How To Use

Start the helper in one terminal:

```bash
cd FE/spa-next/my-next-app/auth-mock-server
npm install
npm run dev
```

Start the frontend in another terminal:

```bash
cd FE/spa-next/my-next-app
npm run dev
```

When using this helper, point the frontend to the mock server as needed, for example by setting
`NEXT_PUBLIC_API_BASE_URL=http://localhost:3005` before starting `my-next-app`.

## Maintenance Policy

- Do not treat this directory as production backend code.
- Keep changes limited to local auth/session verification needs.
- Prefer updating `src/mocks/` first when the goal is standard frontend mock support.
- Do not delete this directory until its remaining users and replacement path are confirmed.

## Notes

- `package.json` runs the TypeScript server in [`index.ts`](./index.ts).
- [`server.js`](./server.js) remains in the directory as a legacy JavaScript version and is not
  the active `npm run dev` entry point.
