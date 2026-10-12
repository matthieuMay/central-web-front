# 03: Reorder with ArrowUp/ArrowDown and Move up/down buttons

**What to build:** with a card selected, the user can change its rank in its column with ArrowUp/ArrowDown or the new Move up / Move down buttons in the selection bar. Impossible moves at the edges do nothing.

**Blocked by:** 02 (Move left/right sends `position` and updates the screen immediately)

**Status:** resolved

- [ ] ArrowUp swaps the selected card with the card above; ArrowDown with the card below. Reload keeps the new order.
- [ ] ArrowUp on the first card and ArrowDown on the last card send no request.
- [ ] While a card is selected, ArrowUp/ArrowDown never scroll the page, even at an edge.
- [ ] Arrows are ignored while the edit drawer is open or focus is in a form control.
- [ ] Move up / Move down buttons do the same as the keys and are disabled at the matching edge, while a move is pending, and while the edit drawer is open.
- [ ] The card stays selected and focused after reordering.
- [ ] A blocked PUT rolls the card back with the error message.
- [ ] `npm run lint` and `npm run build` pass.

## Answer

Resolved on 2026-10-12 at the user's request. Implemented in `d2266ac` (ArrowUp/ArrowDown and Move up / Move down in `src/pages/BoardPage.tsx`, using the shared position helper). The ArrowDown / ArrowUp paths were checked against the local API in ticket 07's agent pass. Open browser checks are listed in the map's Fog.
