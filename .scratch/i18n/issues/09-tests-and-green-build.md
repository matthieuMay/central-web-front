# Tests and green lint/build

Type: task
Status: resolved
Blocked by: 06, 07, 08

## Question

Lock the behaviour in per the spec's Testing Decisions:

- Pin the Source Locale (`fr`) in the shared test setup so existing French assertions pass unchanged.
- Add a test that switches the Locale to English, asserts the interface updates, and asserts the `localStorage` persistence.
- Add a test that the Comment timestamp follows the Active Locale after a switch.
- Add a fallback test: an unloadable Catalog falls back to French rather than blanking the app.
- Run `npm run lint`, `npm run build`, and `npm run test` to green.

Answer records the seams used and the final command results.

## Answer

`src/test-setup.ts` loads and pins `fr`; jsdom lacks `matchMedia`/`ResizeObserver`, so both are stubbed. `src/locale.test.tsx` covers stored-locale resolution, persistence, doc lang, the Header switcher, and `formatDateTime`; `src/locale-fallback.test.tsx` covers fallback to the Source Locale. `Board.test.tsx` wraps the view in `LocaleProvider`. Full suite 37 tests green; `lint` and `build` green.
