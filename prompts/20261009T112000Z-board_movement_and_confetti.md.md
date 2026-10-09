# Sprint 4: Board Card Movement, API Contract, and Confetti Reward

- **API Contract for Card Movement**:
  - Use `PUT /cards/:cardId` with `Content-Type: application/json`.
  - Request body should specify `column` (destination column) and `position` (0-indexed position after removing the card). If `position` is omitted, place the card at the end of the column.
  - Same column: reorder elements. Other column: move and insert.
- **Keyboard Navigation**:
  - Allow selecting a card, then use left/right arrow keys ($\leftarrow \rightarrow$) to move it to an adjacent column.
  - Use up/down arrow keys ($\uparrow \downarrow$) to change its rank within its current column.
  - Prevent any invalid movement at the board edges.
- **Drag-and-Drop Improvements**:
  - Support reordering cards within the same column.
  - Support dropping a card into an adjacent column at the targeted position.
  - Ensure an empty column can successfully accept dropped cards.
- **Reward**:
  - Trigger the confetti effect when a card arrives at the final column.
- **Validation**:
  - Run `npm run lint` and `npm run build` to ensure zero errors and correct build output.
  - Do not implement until explicit go-ahead.