# 02: Move left/right sends `position` and updates the screen immediately

**What to build:** the existing Move left / Move right buttons and ArrowLeft/ArrowRight keys keep working for the user, but the card now moves on screen at once instead of waiting for the server. All moves go through one shared helper that computes the zero-based position after removing the card, and one move mutation that sends `position`. If the request fails, the card returns to its previous place with an error. On success, the board returned by the PUT becomes the displayed board.

**Blocked by:** 01 (Check how the API handles `position`)

**Status:** resolved

- [ ] Selecting a card and pressing Move right / ArrowRight moves it to the end of the next column immediately; reload shows it there.
- [ ] Move left / ArrowLeft works the same way towards the previous column.
- [ ] The PUT request body contains both `column` and `position` (checked in DevTools Network).
- [ ] With the PUT blocked (README fetch snippet adapted to `PUT`), the card moves, then returns to its original place and "Could not move card: … Try again." is shown.
- [ ] Only one move at a time: buttons are disabled and arrows ignored while a move is pending.
- [ ] The card stays selected and focused after a move; edge buttons stay disabled at the first/last column.
- [ ] The existing cross-column animation still works (and stays off under reduced motion).
- [ ] Add card and edit drawer still work together with moves.
- [ ] `npm run lint` and `npm run build` pass.

## Answer

Resolved on 2026-10-12 at the user's request. Implemented in `6658513` and `4e88efd`: `positionAfterRemoval` / `moveCardInBoard` in `src/api/boardMoves.ts`, the move mutation in `src/api/mutations.ts` now sends `position`, updates the screen through the write queue, rolls back on error and writes the returned `BoardData` into the cache. The boxes above were not re-ticked by the agent; open browser checks are listed in the map's Fog.
