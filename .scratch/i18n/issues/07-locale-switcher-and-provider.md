# Header language switcher and provider

Type: task
Status: resolved
Blocked by: 05

## Question

Implement the Active Locale plumbing and the switcher per ticket 04's architecture:

- The locale state store and startup gate, with default resolution (stored → browser → `fr`) and Source-Locale fallback on load failure.
- The Header `Menu` of endonyms (`Français`, `English`, `Español`), showing the Active Locale, keyboard-operable and accessibly named, placed beside the color-mode control.
- Switching updates the interface in place (no full reload) and persists to `localStorage`.
- Route the Comment timestamp through `Intl.DateTimeFormat(ActiveLocale)`.

Answer records the storage key/namespace and confirms manual checks of default resolution and persistence.

## Answer

Implemented per ticket 04: `LocaleProvider` + context + startup gate, Header endonym `Menu` (`Français`/`English`/`Español`) with accessible name `Changer de langue`, `localStorage` persistence, browser-default precedence, `locale-context` and `useLocale` wired in `main.tsx`, and `formatDateTime`-driven Comment timestamps.
