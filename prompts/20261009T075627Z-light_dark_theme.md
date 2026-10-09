# Task

Implement a light/dark theme mode for the web application:

- Detect and apply the system preference with `window.matchMedia('(prefers-color-scheme: dark)')`.
- Add an accessible keyboard-operable header toggle.
- Do not persist manual selection; reloads return to the current system preference.
- Follow system changes until manually toggled, then hold the manual selection until reload.
- Use existing state/theme mechanisms, tokens, conventions, and avoid dependencies.
- Handle SSR/tests where `window` or `matchMedia` is unavailable.
- Add coverage for initial preferences, toggle/keyboard accessibility, no persistence, reload behavior, system changes before/after manual toggle.
- Run relevant tests, lint, and type checks.
