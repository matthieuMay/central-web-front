# Install and configure wuchale (scaffold commit)

Type: task
Status: resolved
Blocked by: 04

## Question

Stand up wuchale with no strings migrated yet, so the repo builds and lints green:

- Install `wuchale` and `@wuchale/jsx` (versions confirmed by ticket 01).
- Add the Vite plugin in the order ticket 01 requires.
- Create `wuchale.config` for a single `main` adapter: JSX adapter with the `react` loader, `locales: ['fr', 'en', 'es']`, French as Source Locale, extraction excluding `*.test.tsx`.
- Generate the loader files and the initial Catalog scaffolding (`npx wuchale`) and confirm the generated artifacts vs committed PO Catalogues (PO committed, compiled output ignored).
- Ensure `npm run lint`, `npm run build`, and `npm run test` all pass with nothing translated yet.

Answer records what was installed/configured and the exact produced file layout, so tickets 06–08 can build on it.

## Answer

Installed `wuchale`, `@wuchale/jsx` (dep), `ai`, `@openrouter/ai-sdk-provider` (dev). Added `wuchale.config.js`, `wuchale.ai.js`, the `wuchale()` Vite plugin, `src/locales/**` catalogs/loader, `npm run i18n`, `.gitignore` for `src/locales/.wuchale` and `.env*`, and an oxlint ignore for `src/locales/**`. `lint`, `build`, and `test` green.
