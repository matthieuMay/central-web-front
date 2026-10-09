# Migrate strings across components and pages

Type: task
Status: resolved
Blocked by: 05

## Question

Apply the extraction checklist from ticket 03:

- Replace hardcoded French UI text (JSX text, `aria-label`, `placeholder`, `label`, headings, loading/error messages, `PREFERENCE_LABELS`) with wuchale-authored Messages across `Header`, pages, and board/card components.
- Express the dynamic strings (`Mode de couleur : ${…}`, `Ouvrir la carte ${card.title}`) as wuchale placeholders.
- Leave API/user content and test files untouched by extraction.
- Confirm extraction picks up every in-scope string and none of the excluded ones; `lint`/`build`/existing tests stay green in the French Source Locale.

Answer records the migrated surface and any string that needed a restructure.

## Answer

wuchale transforms the authored strings at build time, so most components needed no code change. Explicit changes: `PREFERENCE_LABELS` moved inside `Header` so the color-mode names extract; `CardDetail` members conditional wrapped in `Box` (extraction quirk); `CardChecklist` add label hoisted to `addLabel`. 43 Messages extracted into `src/locales/fr.po`, `en.po`, `es.po` scaffolded.
