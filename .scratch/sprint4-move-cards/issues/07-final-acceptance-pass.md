# 07: Final pass — full acceptance checks

**What to build:** verify the whole Sprint 4 feature end to end in the browser and fix any gap found, so the sprint goal is met without breaking earlier features.

**Blocked by:** 03 (Reorder with ArrowUp/ArrowDown), 05 (Drag and drop into a neighbouring column), 06 (Confetti when a card enters the last column)

**Status:** ready-for-agent

- [ ] All 13 acceptance checks of the spec pass (with the placeholder instead of a line).
- [ ] Dragging a card into the last column triggers confetti after API confirmation (and the text message under reduced motion).
- [ ] Dark mode, selection, Move buttons, edit drawer and Add card still work.
- [ ] Every order change persists after reload.
- [ ] No new dependency and no test framework added.
- [ ] `npm run lint` and `npm run build` pass.

## Comments

### 2026-10-12 — agent pass (no browser available)

No Chrome/Chromium is installed on this machine, so the browser checks could not be run. Status stays `ready-for-agent` until a human runs them.

Verified:
- `npm run lint`: 0 warnings, 0 errors. `npm run build`: passes.
- No new dependency and no test framework: `package.json` and `package-lock.json` unchanged since the start of Sprint 4 (`dad2b44`).
- End-to-end against the local API, using the app's own `positionAfterRemoval` / `moveCardInBoard` and the `startMove` confetti rule. All 7 paths: the server board matched the prediction and a fresh GET matched (persistence). Board restored afterwards.
  - ArrowDown / ArrowUp in a column
  - drag within a column; drag between two cards of the neighbouring column; drag into the empty column
  - ArrowRight into the last column (confetti rule: true); reorder inside the last column (confetti rule: false)
- Code read against the spec's 13 checks: each one has matching code.

Fixed in this pass:
- The move error message used `red.700` only, hard to read in dark mode (check 10/11). It now uses `red.700` in light mode and `red.300` in dark mode.

Still to check by hand (browser):
- Checks 1–12 of the spec, especially drag and drop (placeholder jitter during card animations, not-allowed cursor, Escape cancel), confetti origin and timing, the reduced-motion notice, and dark mode readability of the faded card, placeholder and notice.
- The edit drawer's own save error still uses `red.700` only (Sprint 2 code, not changed here).
