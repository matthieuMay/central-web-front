# wuchale + Vite + Vitest integration specifics

Type: research
Status: resolved

## Question

What exactly does wiring wuchale into this React 19 + Vite 8 + Vitest project require? Confirm, from wuchale's own docs and its `@wuchale/jsx` adapter:

- The Vite plugin entry point (`wuchale/vite`) and whether it must precede `@vitejs/plugin-react` in `plugins`.
- The `wuchale.config` shape for a single `main` adapter using the JSX adapter with the `react` loader, `locales: ['fr', 'en', 'es']`, and which Locale is treated as the source/fallback.
- The generated loader file(s) under `localesDir` (paths/names), and which are committed vs build output.
- The **async client loading path**: the generated async proxy, `registerLoaders`, and `loadLocale` from `wuchale/load-utils` — enough to design the startup gate.
- **Vitest specifically:** wuchale's Testing guide says Vitest emulates a server environment and needs the `load-utils/server` path (`loadLocales` + `runWithLocale`), while Testing Library tests use `loadLocale`. Determine which path this project's jsdom + Testing Library setup should use so the shared setup can **pin `fr`**.
- How to configure extraction to **exclude `*.test.tsx`** files (the adapter `files` glob).
- Whether a source-Locale (`fr`) Catalog file is generated, and how fallback behaves for a missing Message.

Return: the concrete config/plugin/loader shape (as prose facts, not a full implementation), the exact package names and versions, and any gotchas for React + Vitest. Verify claims against the wuchale docs (`wuchale.dev`) and the installed package, not memory.

## Answer

wuchale `0.26.7` + `@wuchale/jsx` `0.13.0`. Vite plugin `wuchale()` is first in `plugins`, before `@vitejs/plugin-react`. `wuchale.config.js` uses one `main` adapter (`@wuchale/jsx` with `loader: "react"`), `locales: ["fr","en","es"]`, `localesDir: "src/locales"`, and a `files` glob that ignores `**/*.test.*`. `fr` (first locale) is the Source Locale and the automatic fallback. Committed: `src/locales/{data.js,main.loader.js,plural.js,*.po}`; ignored: `src/locales/.wuchale/**` (compiled catalogs/proxies). Client loading uses `loadLocale` from `wuchale/load-utils` (registered by `main.loader.js`); jsdom + Testing Library uses the same client path, pinned in `src/test-setup.ts`.
