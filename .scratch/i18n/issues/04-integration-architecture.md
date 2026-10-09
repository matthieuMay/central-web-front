# Integration architecture: state store, startup gate, seams

Type: grilling
Status: resolved
Blocked by: 01, 03

## Question

Pin the integration architecture now that the extraction surface (ticket 03) and the wuchale/Vite/Vitest facts (ticket 01) are known:

- **Locale state store:** the module that owns the Active Locale and drives wuchale's loading — its interface (read, set, subscribe), where it lives, and how it stays reactive for React (the `registerLoaders` / `CatalogCollection` seam).
- **Startup gate:** where the gate sits (provider wrapping `App`? a route element?) so the app renders only once the initial Catalog is ready, with Source-Locale fallback on load failure, and how it avoids flashing placeholders.
- **Default resolution:** the exact precedence implementation — stored choice → `navigator.language` mapped to nearest of `fr/en/es` → `fr` — and the `localStorage` key/namespace (reconcile with the color-mode storage question in the map's fog).
- **Date-l10n seam:** the single place that formats a Comment timestamp with `Intl.DateTimeFormat(ActiveLocale)`.
- **Test seam:** how the shared Vitest setup pins `fr` and how a test switches Locale, using the correct `load-utils` path (client vs server) for jsdom + Testing Library.
- **Switcher contract:** the component's props/interface and its accessible name, agreeing with ticket 07.

Produce the interfaces and the seam decisions as prose (no file paths or snippets in the answer beyond interface shapes that encode a decision). This is the last decision ticket; tickets 05–09 execute it.

## Answer

`LocaleProvider` (`src/locale.tsx`) owns the Active Locale and the startup gate: it resolves the initial Locale (stored → `navigator.languages` → `fr`), awaits `loadLocale`, falls back to `fr` on failure, then renders children; it sets `document.documentElement.lang`. `src/locale-context.ts` holds `LOCALES`, `Locale`, `LOCALE_NAMES` (endonyms, non-translatable), `LOCALE_STORAGE_KEY = "mini-trello.locale"`, `resolveInitialLocale`, `storeLocale`, `formatDateTime`, and the context/`useLocale`. The switcher is a Chakra `Menu` in `Header`. Date seam is `formatDateTime(locale, iso)` in `CardComments`. Test seam pins `fr` via `loadLocale("fr")` in `src/test-setup.ts`.
