# Card movement

Status: ready-for-agent

## Goal

Move cards on the board with the keyboard (and buttons) or by drag and drop, persisted through the API. Confetti celebrates a card reaching Done.

## API

`PUT /cards/:cardId` with `{"column": "<columnId>", "position": <n>}` returns `BoardData`.

- `position` is a 0-based index in the destination column, counted **after** the card is removed from its current place. It applies to same-column moves too.
- Omitting `position` appends to the end.
- `position < 0` or `> length` (after removal) is a 400 `Position out of range`.

## Decisions

1. **Keyboard / buttons** (card selected by clicking, keys ignored in form controls and the edit Drawer):
   - ←/→ move the card to the neighbouring column, **appended at the end** (no `position`).
   - ↑/↓ move the card one place in its column (`position` = index − 1 / index + 1).
   - At an edge (first/last column, first/last card) nothing happens and the matching button is disabled.
   - Buttons: Move left, Move right, Move up, Move down.
2. **Drag and drop** with `react-dnd` + HTML5 backend:
   - Reorder within a column, move to any column, dropped at the spot under the pointer (a line shows where).
   - An empty column accepts a card.
   - Dropping a card back on its own place sends nothing.
3. **Optimistic**: every move updates the cache immediately through the shared board-write ledger; a failed move rolls back and shows an error; the board is refetched once all writes settle.
4. **Confetti** fires when a card enters the `done` column from another column (any method), not on reorder inside Done or creation. It bursts from the card's landing spot in a page overlay, and is skipped for reduced-motion users.

## Out of scope

Touch drag and drop (the HTML5 backend does not support touch), keyboard drag and drop through react-dnd.
