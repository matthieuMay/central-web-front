# Wayfinder — Internationalisation (wuchale)

Label: wayfinder:map

## Destination

A `central-web-front` where every user-facing and accessible string renders through **wuchale** from a French Source Locale, with a Header language switcher (`Français`, `English`, `Español`) persisted to `localStorage` and browser-defaulted, lazy per-Locale Catalog loading behind a startup gate, Locale-aware date formatting, AI-drafted `en`/`es` Catalogues via OpenRouter, and `lint`/`build`/tests green. The [`to-spec` output](./spec.md) is the plan; the map resolves the decisions the spec leaves open **and carries execution** (see Notes).

## Notes

- Repo `central-web-front` (branch `cjallat/sprint6`). Front-only: no backend change is in scope.
- **Execution is in scope for this map** (an override of wayfinder's planning-only default): the effort ends with strings migrated and the app shipping three Locales, not merely decisions.
- Skills every session should consult: "grilling" and "domain-modeling" (HITL); "research" for the two AFK tickets.
- Glossary: root `CONTEXT.md` — Locale, Source Locale, Active Locale, Message, Catalog (added by this effort), plus the existing Board/Card vocabulary.
- Tracker: local Markdown (`docs/agents/issue-tracker.md`). Frontier = open, unblocked, unclaimed tickets in `./issues/`, first by number.
- Standing preference: decisions first, but execution is expected here; the first commit is deliberate scaffolding with `lint`/`build` green.
- Facts established while charting: wuchale `0.26.x`, Vite plugin `wuchale/vite`, React adapter `@wuchale/jsx` (loader `react`); built-in `ai` is Gemini-only, so OpenRouter needs a custom `ai.translate`; the UI is currently hardcoded French, including `aria-label`/`placeholder`; `CardComments` formats dates with the browser-default `toLocaleString()`.

## Decisions so far

- [Internationalisation (spec)](./spec.md): front-only; wuchale compile-time i18n with a French Source Locale; ship `fr`/`en`/`es`.
- **Added this effort:** Locale, Source Locale, Active Locale, Message, Catalog in `CONTEXT.md`; ADR `0003` on wuchale vs Lingui/react-i18next.
- **Source Locale `fr`**, current text verbatim; `en`/`es` are AI-drafted via OpenRouter and flagged for review.
- **Active Locale is client state** (global state + `localStorage`), clean URLs; precedence stored → browser preference → `fr`.
- **Catalogs load lazily per Locale** with a startup gate; fallback to the Source Locale on load failure.
- **Extraction surface = every user-facing *and* accessible string**, dynamic strings as wuchale placeholders; API/user data and `*.test.tsx` excluded.
- **Switcher = Header `Menu` of endonyms** beside the color-mode control; keyboard-operable.
- **Comment timestamps use `Intl.DateTimeFormat(ActiveLocale)`**; wuchale l10n for future plurals/numbers.
- **AI via OpenRouter** (`@openrouter/ai-sdk-provider` + Vercel AI SDK), key from `OPENROUTER_API_KEY`, dev/CLI convenience with review flags.
- **Tests pin `fr`** in the shared setup so existing French assertions survive; one added test covers switching + persistence.
- **Implemented.** Tickets 01–07 and 09–10 resolved; the app ships `fr`/`en`/`es` with wuchale, the Header switcher, lazy catalogs, locale-aware dates, and a green `lint`/`build`/37-test suite. Two wuchale parser quirks were worked around (see ticket 03). Ticket 08 (drafting `en`/`es`) remains open pending the user's `OPENROUTER_API_KEY`; the provider is wired and `npm run i18n` will draft the catalogs once the key is exported.

## Not yet specified

<!-- in-scope fog; graduates to tickets as the frontier advances -->

- The exact placeholder/nesting shape for each dynamic string, and whether any require component restructuring rather than a simple interpolation.
- Whether the Locale and color-mode preferences share one storage key/namespace or stay independent entries.
- How the startup gate composes with `react-router` route rendering and with the test harness (a possible shared provider seam).
- Whether catalog loading ever needs `loading.granular`/multiple adapters if the Message count grows, and when that migration would be worth it.
- Whether the switcher's endonyms are hardcoded constants or themselves Messages (they are language names, not interface chrome).

## Out of scope

<!-- work ruled beyond the destination; never graduates -->

- Localising API/user content (Card titles, descriptions, Comments, User names).
- Backend/server error messages and any `central-web-api` change.
- URL-based Locale routing, prefixes, `hreflang`, and SEO.
- Server-side rendering and per-request Locale isolation.
- Locales beyond `fr`, `en`, and `es`.
- Translating test files.
- Behaviour changes to Move, Card Detail, or color mode beyond routing their strings through wuchale.
