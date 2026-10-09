# Glossary terms and ADR

Type: task
Status: resolved

## Question

Capture the domain documentation this effort agreed:

- Add **Locale**, **Source Locale**, **Active Locale**, **Message**, and **Catalog** to `CONTEXT.md`, implementation-free (no wuchale internals such as adapter, loader, runtime).
- Write `docs/adr/0003-wuchale-for-i18n.md`: the compile-time wuchale decision, French Source Locale, shipped `fr`/`en`/`es`, runtime switcher with `localStorage`, OpenRouter AI, and the considered alternatives (Lingui, react-i18next) — in the one-paragraph style of ADRs 0001/0002.
- Note the deliberate contrast with ADR 0001 (Locale is persisted; the color-mode preference is not).

Answer records the terms added and the ADR path.

## Answer

Done during charting: `CONTEXT.md` gained Locale, Source Locale, Active Locale, Message, Catalog; `docs/adr/0003-wuchale-for-i18n.md` records the decision.
