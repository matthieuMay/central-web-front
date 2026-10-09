# Internationalisation (wuchale)

Status: ready-for-agent

## Problem Statement

The interface is a single language. Every visible and accessible string is hardcoded French, so the app can only ever serve French readers; adding a second language today would mean editing every component and every test, and there is no way for a user to choose a language at all. Translating the interface is not a one-off edit — it is a missing capability.

## Solution

The app gains internationalisation through **wuchale**, a compile-time i18n tool: UI text is authored naturally in the markup, extracted into a per-Locale Catalog, and compiled into small index-based lookups. **French becomes the Source Locale** — the existing text is kept verbatim and nothing is re-authored. The interface ships in **French, English, and Spanish**; a **language switcher in the Header** lets the user pick the Active Locale, which is remembered in `localStorage` and otherwise derived from the browser's preference, falling back to French. All user-facing *and* accessible strings are translated, and the Comments timestamp is formatted in the Active Locale. English and Spanish are drafted with AI through **OpenRouter** (key supplied by the environment) and flagged for human review. Catalogues are loaded lazily per Locale behind a brief startup gate so no wrong-language flash is shown.

## User Stories

1. As a visitor whose browser prefers Spanish, I want the interface to open in Spanish, so that I understand it without configuring anything.
2. As a returning user, I want my chosen Locale to still be selected after I reload, so that I do not have to pick it again.
3. As a user, I want to switch the Locale from the Header, so that I can read the app in a language I know.
4. As a user, I want the switcher to name each Locale in its own language, so that I can find mine even when the Active Locale is unreadable to me.
5. As a blind user, I want every accessible name — aria-labels, headings, button names, placeholders — translated too, so that switching Locale never leaves half the interface in French.
6. As a user, I want Comment timestamps formatted in the Active Locale, so that dates agree with the rest of the interface.
7. As a developer, I want to write UI text naturally in the markup, so that I do not maintain a parallel key file.
8. As a developer, I want French to remain the Source Locale, so that existing text and tests do not churn.
9. As a developer, I want the app to ship `fr`, `en`, and `es`, so that three audiences are served.
10. As a translator, I want translatable Messages collected in a standard, familiar format, so that I can review and improve them.
11. As a translator, I want machine-drafted translations clearly flagged, so that I know which ones still need review.
12. As a maintainer, I want machine translations generated through a provider I choose (OpenRouter), so that I am not locked into one vendor.
13. As a maintainer, I want the AI provider's key supplied by the environment, so that no secret is committed to the repo.
14. As a first-time visitor, I want no flash of the wrong language, so that the interface is stable from the first paint.
15. As a user on a slow connection, I want only my Active Locale's Catalog loaded, so that the page stays fast.
16. As a user, I want switching Locale to update the interface without a full reload, so that it feels instant.
17. As a keyboard user, I want to operate the language switcher without a pointer, so that I have equal access.
18. As a user whose Catalog fails to load, I want a sensible fallback, so that the app still works.
19. As a developer, I want the existing suite to keep passing with its French assertions, so that i18n does not disturb unrelated tests.
20. As a developer, I want a test proving the Locale choice persists, so that the switcher's behaviour is protected.
21. As a maintainer, I want the tooling decision recorded in an ADR, so that future readers know why wuchale was chosen over the alternatives.
22. As a reader of the codebase, I want the language terms defined in the glossary, so that Locale, Source Locale, Active Locale, Message, and Catalog each mean one thing.

## Implementation Decisions

### Tooling and locales

- **wuchale**, integrated as a compile-time Vite plugin with the JSX adapter configured for React. UI text stays authored inline; wuchale extracts Messages, keeps them in a source Catalog per Locale, and compiles them into index-based lookups.
- **Source Locale is French.** Existing strings are kept verbatim; `fr` is the fallback Locale. The shipped set is `fr`, `en`, `es`.
- **Catalog format is the default Gettext PO**, committed to the repo so translators can review it. wuchale's generated compiled artifacts are build output and are not committed.

### Active Locale and the switcher

- The Active Locale is **client state, not part of the URL**: global state plus a `localStorage` entry. Clean routes are kept; no path or search-param locale, and no SEO/hreflang work.
- **Default resolution precedence:** stored choice → browser preference (nearest of `fr`/`en`/`es` from `navigator.language`) → French.
- The **switcher lives in the Header**, beside the existing color-mode control, as a Chakra `Menu` listing the three **endonyms** (`Français`, `English`, `Español`) and showing the Active Locale. It is keyboard-operable and has an accessible name.
- Changing the Locale is reactive: the interface updates in place, without a full reload.

### Loading and rendering

- Catalogs are loaded **lazily, per Locale**, using wuchale's client loading utilities. A **startup gate** renders the app only once the initial Catalog is ready, avoiding a flash of the wrong language (or of placeholders). If a Catalog cannot be loaded, the app falls back to the Source Locale rather than rendering nothing.

### Extraction surface

- **Every user-facing and accessible string is in scope**: JSX text, `aria-label`, `placeholder`, `label`, headings, button text, loading and error messages, and the color-mode names.
- **Dynamic strings** are in scope and must be expressed as wuchale placeholders rather than concatenation — for example the color-mode control's accessible name and the "open card" button's accessible name, both of which interpolate a value.
- **Excluded:** API/user content (Card titles, descriptions, Comments, User names) is data, not interface text, and is never extracted; and `*.test.tsx` files are excluded from extraction so assertions do not become Catalog entries.

### Formatting

- The Comment timestamp is formatted with `Intl.DateTimeFormat` driven by the Active Locale, replacing the browser-default `toLocaleString()`. wuchale's l10n facilities cover any future plurals or numbers.

### AI translation

- wuchale's built-in AI only supports Gemini, so **`ai.translate` is implemented against OpenRouter** via the Vercel AI SDK's OpenRouter provider, with the key read from the `OPENROUTER_API_KEY` environment variable and never committed. Model, `batchSize`, and `parallel` are configuration; a cheap multilingual model is the default.
- AI translation is a **development/CLI convenience**: it drafts `en`/`es` Messages, marks them for review, and never re-translates an already-translated Message. Human edits always win.

### Testing and domain docs

- The source-locale Catalog is **loaded and pinned to `fr` in the shared test setup**, so existing French assertions continue to pass unchanged.
- New tests cover the switcher's external behaviour (selecting a Locale updates the UI and persists to `localStorage`).
- An **ADR (`0003`)** records the wuchale/source-locale decision against the considered alternatives (Lingui, react-i18next).
- The terms **Locale**, **Source Locale**, **Active Locale**, **Message**, and **Catalog** are added to `CONTEXT.md`.

## Testing Decisions

- Good tests assert external behaviour through the highest available seam — how the interface renders and what the user observes — never wuchale's internals (no assertions on `loadID`s, compiled arrays, or loader functions).
- **Highest seam:** the Board view under a query client and a mocked `fetch` (extending the existing Board tests). The suite runs in the Source Locale by default, so current French assertions stand; one added test switches to English, asserts the interface updates, and asserts the persisted `localStorage` value.
- **Formatting:** assert the Comment timestamp follows the Active Locale after a switch.
- **Fallback:** assert that an unloadable Catalog falls back to French rather than blanking the app.
- **Prior art:** `src/components/Board.test.tsx` and `src/color-mode.test.tsx` (Vitest + Testing Library, behaviour-first, `vi.stubGlobal` for `fetch`), following wuchale's Testing Library guidance for loading the Catalog before render.
- **Sign-off:** the immediate deliverable is the map's first-commit scaffold ticket; behaviour lands in later tickets.

## Out of Scope

- Localising API or User content (Card titles and descriptions, Comments, User names) — that is data, not interface text.
- Server-provided error messages or any backend change.
- URL-based Locale selection, route prefixes, `hreflang`, and SEO.
- Server-side rendering or per-request Locale isolation — this is a client-only SPA.
- Locales beyond `fr`, `en`, and `es`.
- Translating test files or using a non-source test Locale as the default.
- Any change to the Move, Card Detail, or color-mode behaviour beyond routing their strings through wuchale.

## Further Notes

- The wayfinder map for this effort lives at `./map.md`; its open tickets and fog resolve whatever this spec leaves unsharpened.
- The first commit is deliberate scaffolding: wuchale installed and configured, the Vite plugin wired, and the app building and linting green before any string is migrated.
- Two research tickets (wuchale + Vite/Vitest integration; OpenRouter + wuchale AI configuration) run before the architecture ticket, because their findings pin the exact plugin order, loader generation, test setup, and AI provider wiring.
- Trade-off acknowledged: persisting the Locale in `localStorage` contrasts with ADR `0001`, which deliberately does **not** persist the color-mode preference; the Locale is an explicit long-lived user choice, an appearance override is not.
