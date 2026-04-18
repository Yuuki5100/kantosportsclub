# `src/stories`

`src/stories` is reserved for cross-cutting Storybook demos that exercise app-level wiring or
verification flows which do not fit a single component directory.

Current stories:

- `DatePicker.stories.tsx`: interactive verification for the shared `DatePicker`, including value,
  validation, `onBlur`, and day-of-week restrictions.
- `WebSocketDemo.stories.tsx`: integration-style demo for WebSocket provider behavior,
  subscriptions, and snackbar interactions.

Removed template samples:

- `Button`, `Header`, and `Page`: default Storybook starter examples unrelated to this product.
- `Configure.mdx` and `assets/`: onboarding and documentation assets from the Storybook template.

Component-focused stories should live next to the component they document under `src/components/...`.
