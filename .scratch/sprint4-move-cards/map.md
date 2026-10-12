# Sprint 4 — Move cards and reward the user

Spec: [spec.md](spec.md) · ADR: [adr-0001-native-drag-and-drop.md](adr-0001-native-drag-and-drop.md)

## Notes

- `moveCard` in `src/api/board.ts` sends only `{ column }`; `position` is not used yet.
- `useMoveCard` in `src/api/mutations.ts` waits for the server, ignores the returned `BoardData`, then refetches.
- `useCreateCard` and `useEditCard` update the screen right away through the shared write queue (`begin` / `rollback` / `settle`).
- `BoardPage` handles only ArrowLeft, ArrowRight and Escape. ArrowUp/ArrowDown currently scroll the page.
- `src/components/Confetti.tsx` is not used anywhere. It ignores reduced motion, has no positioned parent, and calls `Math.random()` during render.
- `motion` is already installed. Cards animate between columns, and this animation is off for reduced-motion users.

## Decisions so far

Agreed with the user on 2026-10-12.

### Technical

1. **Drag and drop:** use the browser's built-in HTML5 drag and drop. No new dependency. See the ADR.
2. **Screen update:** move the card on screen immediately through the existing write queue, and roll it back with an error if the request fails. This replaces the Sprint 2 rule "failed moves leave the card in place". Confetti still waits for the API.
3. **PUT response:** write the returned `BoardData` into the board query cache.
4. **Position logic:** one helper computes the zero-based `position` after removing the card. Keyboard, buttons and drag and drop all use it.
5. **One move at a time:** arrows, Move buttons and dragging are disabled while a move is pending.
6. **`Confetti.tsx` may be edited:** fixed-position overlay, random values generated when triggered (not during render), renders nothing under reduced motion.

### UX

7. **Allowed drop targets:** the card's own column and the columns directly next to it. Other columns refuse the drop.
8. **Edges:** ArrowUp on the first card and ArrowDown on the last card do nothing (no request, no wrap-around). While a card is selected, ArrowUp/ArrowDown never scroll the page.
9. **Dragging selects the card,** so keyboard and buttons can continue from there.
10. **Confetti trigger:** only when a card enters the last column from another column, after the API confirms. Reordering inside the last column does not count. Applies to keys, buttons and drag.
11. **Reduced motion:** no confetti. Show a short visible message, "🎉 Moved to <last column title>", instead.
12. **Screen-reader announcements for moves:** out of scope.

### UI

13. **Move up / Move down buttons** next to Move left / Move right, disabled at the edges.
14. **Drag source:** the whole card, except its ✎ button. A click without dragging still selects.
15. **Drop indicator:** a placeholder the size of the dragged card, shown where the card will be inserted (also in an empty column), and the dragged card faded out. Readable in light and dark mode. Replaces the earlier "coloured line" idea (user request, 2026-10-12).
16. **Confetti location:** bursts from the card's new position in the last column.
17. **Touch screens:** dragging is not supported on touch. Touch users use the Move buttons.

### Process

18. Spec and short ADR live in `.scratch/sprint4-move-cards/`. No README section.

### API behaviour (decision 19, checked with curl on 2026-10-12, ticket 01)

`PUT /cards/:cardId` against the local API at `http://localhost:3000`:

| Request | Result |
| --- | --- |
| No `position` | 200, card appended at the end of the target column |
| Same column, `[1,2,3]`, card-1 → `position` 2 | 200, `[2,3,1]`: index is counted **after removing** the card |
| Same column, `position` 3 (= length before removal) | 400 `Position out of range` |
| Other column, `position` = target length (end) | 200, appended |
| Empty column, `position` 0 | 200 |
| Middle of other column, `position` 1 | 200, inserted between the two cards |
| `position` 99 or −1 | 400 `Position out of range` |
| `position` 1.5, `"1"` or `null` | 400 `Position must be an integer` |
| Unknown column | 404 `Column not found` |
| Unknown card | 404 `Card not found` |

- Success returns the full `BoardData` (`id`, `title`, `columns`), and a fresh GET shows the same order, so it persists.
- Failed requests change nothing on the server.
- Valid range is `0 ≤ position ≤ length of the target column without the moved card`. The front end must compute it this way, or the API will reject the move with a 400 and the card will roll back.
- The API does not clamp or round invalid positions; it rejects them.
- A no-op move (same column, same index) is accepted (200), but the spec still says not to send it.
- Error bodies are JSON `{ "error": "<message>" }`. The current request helper only shows the HTTP status, not this message.

## Fog

Tickets 02–07 were marked resolved on 2026-10-12. These points are still open:

- **Browser checks not run by an agent** (no Chrome on the agent's machine, see ticket 07): spec checks 1–12, especially placeholder jitter during card animations, the not-allowed cursor on far columns, Escape to cancel a drag, confetti origin and timing, the reduced-motion notice, and dark mode readability of the faded card, placeholder and notice.
- **Placeholder style chosen, light/dark check pending:** 2px dashed `blue.fg` border on `blue.subtle` (`src/components/Column.tsx`).
- **Edit drawer error colour:** the save error in `src/components/EditCardDrawer.tsx` still uses `red.700` only, hard to read in dark mode (Sprint 2 code; the move error was fixed).
- **API error messages hidden:** the request helper in `src/api/board.ts` shows only the HTTP status, not the JSON `{ "error": "<message>" }` body (e.g. `Position out of range`).

## Tickets

`issues/01` → `02` → (`03`, `04` → `05`, `06`) → `07`. See `issues/` for blocking edges.
