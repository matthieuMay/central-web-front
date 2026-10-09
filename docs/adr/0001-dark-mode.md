# Dark mode follows the OS, with a per-tab override that resets on refresh

The app follows the OS colour scheme live through `next-themes` (`attribute="class"`, which is what Chakra UI v3's `_dark` condition targets). The header toggle sets a manual light/dark choice that ignores OS changes until the page is refreshed, and only applies to its own tab. `next-themes` always persists the theme in `localStorage` and syncs it across tabs, so `src/components/ui/color-mode.tsx` gives it a fresh `theme-<timestamp>-<uuid>` key per page load, removes that key on `pagehide`, and sweeps keys older than a week. We don't delete other tabs' keys at startup, because `next-themes` treats a removed key as "reset to system". `next-themes` can't apply the theme before first paint in this client-only Vite app (React doesn't execute scripts it inserts), so `index.html` has an inline script that sets the OS theme class and `color-scheme` first.

## Consequences

- Components must use Chakra semantic tokens (`bg.panel`, `bg.subtle`, `bg.muted`, `fg`, `fg.muted`, `blue.fg`, …) or `var(--chakra-colors-*)` in CSS, never raw palette colours like `gray.100` or hex values, otherwise they won't adapt to dark mode. The confetti colours are a deliberate exception: they're bright enough on both themes.
