# Spec — Sprint 4: move cards and reward the user

Status: needs-triage

Decisions: [map.md](map.md) · ADR: [adr-0001-native-drag-and-drop.md](adr-0001-native-drag-and-drop.md)

## Goal

Users can change a card's column and its rank in a column with the keyboard, buttons, or drag and drop. The new order persists after a reload. When a card reaches the last column, the user gets a confetti reward.

## API contract

`PUT /cards/:cardId` (local API: `http://localhost:3000`)

```json
{ "column": "<columnId>", "position": 0 }
```

- `position` is the zero-based index in the target column **after removing the moved card**.
- Without `position`, the card goes to the end of the column.
- The response is the full `BoardData`.

Example: column `[A, B, C]`, move `A` below `C` → after removing `A` the column is `[B, C]`, so `position` = 2.

## Behaviour

### Shared rules

- All moves (keyboard, buttons, drag) compute `position` with one helper and call the same move mutation.
- The move appears on screen immediately. If the request fails, the card returns to its previous place and an error message is shown ("Could not move card: … Try again.").
- On success, the returned `BoardData` replaces the cached board.
- Only one move at a time: while a move is pending, arrow keys, Move buttons and dragging do nothing.
- Moves are ignored while the edit drawer is open or focus is in a form control (existing rule).
- A move that would not change anything (same column, same index) sends no request.
- After a move, the card stays selected and keeps focus.

### Keyboard (card selected)

| Key | Effect | At the edge |
| --- | --- | --- |
| ArrowLeft | Move to the end of the previous column (existing) | First column: nothing |
| ArrowRight | Move to the end of the next column (existing) | Last column: nothing |
| ArrowUp | Swap with the card above (`position` = current index − 1) | First card: nothing |
| ArrowDown | Swap with the card below (`position` = current index + 1) | Last card: nothing |
| Escape | Deselect (existing) | — |

While a card is selected, ArrowUp/ArrowDown never scroll the page (`preventDefault`), even at an edge.

### Buttons

The selection bar shows **Move left**, **Move right**, **Move up**, **Move down**. Each is disabled at the matching edge, while a move is pending, and while the edit drawer is open.

### Drag and drop (desktop mouse)

- The whole card is draggable, except its ✎ button. A plain click still selects/deselects.
- Starting a drag selects the dragged card.
- While dragging, the dragged card is faded out.
- Drop targets: the card's own column and its direct neighbours. Other columns do not accept the drop (no indicator, `not-allowed` cursor).
- The drop index is computed from the pointer position: before the first card whose vertical middle is below the pointer, otherwise at the end.
- A placeholder the size of the dragged card appears where the card will be inserted, including in an empty column. Only one placeholder is visible at a time. It must be readable in light and dark mode.
- An empty column accepts a drop (`position` = 0).
- Dropping outside a valid target, or pressing Escape during the drag, cancels with no request.
- Touch dragging is not supported; touch users use the buttons.

### Confetti

- Fires only when the API confirms a move where the card **entered** the last column (`board.columns[board.columns.length - 1]`) from another column. Reordering inside the last column does not fire it.
- Fires for keyboard, button and drag moves alike.
- Bursts from the moved card's position, in a fixed overlay that does not block clicks (`pointer-events: none`) or shift the layout.
- With `prefers-reduced-motion: reduce`, no confetti. Instead show a short visible message: "🎉 Moved to <last column title>".
- `src/components/Confetti.tsx` may be changed: generate random values when triggered (not during render), render nothing under reduced motion, position itself in a fixed overlay.

## Must keep working

- Dark mode, card selection, Move left/right buttons, edit drawer, Add card forms.
- Existing cross-column card animation (disabled under reduced motion).

## Out of scope

- Screen-reader announcements of moves.
- Touch drag and drop.
- Moving more than one column at a time.
- README changes.

## Constraints

- Simple, readable code for a beginner.
- No new dependency (see ADR).
- No test framework.
- `npm run lint` and `npm run build` must pass.

## Before coding

Check with curl how the API handles a missing `position`, a `position` larger than the column length, and a negative `position`. Record the result in the map's Fog section.

## Acceptance checks (manual, Chrome DevTools)

1. Select a middle card, press ArrowUp then ArrowDown: it moves up then back; reload → order kept.
2. Select the first card, press ArrowUp: nothing happens, no request, the page does not scroll. Same for the last card with ArrowDown.
3. Move up / Move down buttons behave like the arrows and are disabled at the edges.
4. Drag a card to a new place in the same column; reload → order kept.
5. Drag a card into the neighbouring column between two cards; it lands there; reload → kept.
6. Drag a card into an empty column; it is accepted.
7. Drag a card to a column two steps away: the drop is refused.
8. Move a card into the last column (by key, button and drag): confetti appears once the API answers. Reorder inside the last column: no confetti.
9. With reduced motion emulated: no confetti, the text message appears instead.
10. Block the PUT (README fetch snippet adapted to `PUT`): the card moves, then returns with an error; no confetti.
11. Dark mode: the drag placeholder and selected card stay readable.
12. The edit drawer still opens, saves and cancels; Add card still works.
13. `npm run lint` and `npm run build` pass.
