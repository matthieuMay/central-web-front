# Automatic Dark Mode

Status: ready-for-agent

## Problem Statement

The app is light-only. Users who prefer dark UIs (at the OS level) get a bright interface that ignores their system setting, and there is no way to choose light or dark manually.

## Solution

The app follows the operating system's color-scheme automatically, and also lets the user override it to light or dark from the Header. The choice is not persisted, so on each load the app returns to following the OS. All existing screens render correctly in both modes.

## User Stories

1. As a user whose OS is in dark mode, I want the app to appear dark automatically, so that it doesn't strain my eyes.
2. As a user whose OS is in light mode, I want the app to appear light automatically, so that it matches the rest of my system.
3. As a user, I want the app to react when I change my OS theme while it's open, so that I don't have to reload.
4. As a user, I want a control in the Header to override the mode to Light, so that I can force light when I want it.
5. As a user, I want to override the mode to Dark, so that I can force dark even if my OS is light.
6. As a user, I want a "System" option that restores following the OS, so that I can undo my override.
7. As a user, I want the override to reset on reload, so that the app always starts from my OS preference.
8. As a user, I want every page (Home, Board, Not Found) to be legible and coherent in both modes, so that nothing looks broken.
9. As a user, I want navigation links, cards, and columns to adapt their colors, so that there are no jarring white patches in dark mode.
10. As a keyboard user, I want the theme control to be focusable and operable, so that I'm not excluded.
11. As a screen-reader user, I want the theme control to announce its current state, so that I know which mode is active.
12. As a user, I want no flash of the wrong theme on load, so that the page doesn't flicker light-then-dark.

## Implementation Decisions

- **Mechanism**: a custom Color Mode provider at the application root, mounted inside the Chakra provider. `next-themes` is **rejected** because there is no persistence and its main value is storage; a small `matchMedia`-based hook is simpler and dependency-free.
- **State**: a `Color Mode Preference` of `system | light | dark`, defaulting to `system`, held in React context (no store, no storage).
- **Application**: the provider toggles the `dark` class on the document root (`<html>`) based on the resolved Color Mode. Chakra v3's built-in `_dark`/`_light` semantic tokens respond to the `.dark` ancestor class, so no custom `createSystem` theme is needed.
- **Resolution**: in `system` mode, listen to the `prefers-color-scheme` media query and re-resolve on change. In `light`/`dark`, the media query is ignored.
- **No flash**: set the initial class before first paint (inline script in the HTML shell or an equivalent pre-hydration step), derived from the media query.
- **Public interface**: a `useColorMode`-style hook exposing the current preference, the resolved mode, and a setter/cycle function.
- **Toggle UI**: a three-state control in the Header cycling `system -> light -> dark`, reusing existing Chakra components; dark/light icons plus an accessible label reflecting the current state.
- **Token migration**: convert all hardcoded colors to Chakra semantic tokens - components using `bg="gray.50"`, `bg="white"`, `color="gray.600"`, `color="blue.700"`, and the hex values in `src/index.css` (`.nav-link`, hover, current, focus states).
- **Glossary**: the terms `Color Mode`, `System Preference`, `Color Mode Preference`, and `Automatic Dark Mode` are defined in `CONTEXT.md`.
- No new route, no settings page, no user profile concept is introduced.
- See ADR `docs/adr/0001-no-persisted-color-mode-preference.md` for the no-persistence trade-off.

## Testing Decisions

- Good tests assert external behavior only: given a media-query state and a preference, the resolved Color Mode and the presence/absence of the `dark` class are correct.
- Single seam: the provider boundary at the app root, exercising `system`/`light`/`dark` and media-change behavior.
- **Blocker to flag**: the repo has **no test runner** (no Vitest/Jest; only `oxlint`, `tsc`, and `chrome-devtools-mcp`). So either (a) add Vitest + jsdom to host this one seam, or (b) verify manually/browser-side via the existing chrome-devtools tooling and defer automated tests. Recommendation: (a).

## Out of Scope

- Persisting the preference (explicitly rejected).
- Per-user or server-side theme storage.
- Theming beyond light/dark (e.g. high-contrast, sepia, custom brand colors).
- A settings page or user profile.
- Theming third-party embeds.

## Further Notes

- Trade-off accepted knowingly: a manual override that resets on reload. This keeps Automatic Dark Mode as the always-true default.
- The vendor file `.agents/skills/triage/OUT-OF-SCOPE.md` states the project doesn't support theming; that's skill documentation, not a project decision, and this spec supersedes it for this feature.