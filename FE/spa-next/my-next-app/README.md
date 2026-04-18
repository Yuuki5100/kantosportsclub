This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Mocking And Local Auth Helpers

The default frontend mock path is `NEXT_PUBLIC_USE_MOCK_MODE=true` with the handlers under
`src/mocks/`.

`auth-mock-server/` is kept separately as an optional local development helper for manual checks
of cookie-based auth/session behavior. It is not the primary mock path for routine frontend work.
See [`auth-mock-server/README.md`](./auth-mock-server/README.md) for its responsibility,
supported use cases, and maintenance policy.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## Component Index Auto-Generator

This project includes a custom script to automatically generate `index.ts` files for component directories like `base`, `composite`, and `functional`.

### Usage

To regenerate all `index.ts` files under `src/components`, run the following command:

```bash
npm run generate-index
```

This will:

- Add `export { default as ComponentName } from "./ComponentName";` for each `.tsx` file
- Add `export * from "./subfolder";` for subdirectories with their own `index.ts`
- Update or overwrite the `index.ts` files in each relevant folder

### Example

For a directory structure like this:

```
components/
└─ base/
   ├─ Spacer.tsx
   └─ box/
      ├─ Box.tsx
      └─ FlexBox.tsx
```

The script will generate:

**`base/index.ts`**
```ts
export * from "./box";
export { default as Spacer } from "./Spacer";
```

**`base/box/index.ts`**
```ts
export { default as Box } from "./Box";
export { default as FlexBox } from "./FlexBox";
```

You can freely add new component files and rerun the script to keep the exports up to date.



## Page Generator

This project includes a script to quickly scaffold new pages in `src/pages`.

### Usage

To create a new page, run:

```bash
npm run generate-page <page-name>
```

For example:

```bash
npm run generate-page user
```

This will automatically:

1. Create a new folder: `src/pages/user/`
2. Generate the following files:
   - `User.tsx`: a page component with title and description using language support
   - `user.lang.ts`: multi-language label definitions (`ja` / `en`)
   - `index.ts`: re-exports the main component
3. Add route configuration to:
   - `src/config/pageConfig.ts`
   - `src/config/breadcrumbMap.ts`

### Example Output

**src/pages/user/User.tsx**
```tsx
import React from "react";
import BasePage from "@/components/composite/BasePage";
import { useLanguage } from "@/hooks/useLanguage";
import lang from "./user.lang";

const UserPage: React.FC = () => {
  const l = useLanguage(lang);

  return (
    <BasePage>
      <h1>{l.title}</h1>
      <p>{l.description}</p>
    </BasePage>
  );
};

export default UserPage;
```

**src/pages/user/user.lang.ts**
```ts
export default {
  ja: {
    title: "Userページ",
    description: "Userの説明",
  },
  en: {
    title: "User Page",
    description: "Description of User page.",
  },
};
```

**pageConfig.ts に自動追記される内容**
```ts
"/user": { name: "Userページ", resourceKey: "user", requiredPermission: 0 },
```

**breadcrumbMap.ts に自動追記される内容**
```ts
{ id: "user", label: "User", url: "/user", parentId: "home" },
```

This allows for consistent routing, permissions, and breadcrumb configuration across the app.
```

---
