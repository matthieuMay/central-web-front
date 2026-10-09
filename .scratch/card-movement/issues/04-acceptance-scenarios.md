Type: grilling
Status: resolved

Blocked by: 01, 02, 03

## Question

What end-to-end acceptance scenarios and observable outcomes are required to hand implementation off confidently, covering arrow boundaries, append semantics, arbitrary drag insertion, cancellation, persistence, keyboard parity, desktop-only scope, and confetti transitions?

## Answer

The handoff must include Given/When/Then scenarios suitable for automated tests and a manual desktop verification checklist.

### Required scenarios

- **Up boundary:** Given a card is first in its column, when the user invokes up, the order is unchanged and no move request is sent.
- **Down boundary:** Given a card is last in its column, when the user invokes down, the order is unchanged and no move request is sent.
- **Adjacent reorder:** Given at least two cards, when the user invokes up or down on a non-boundary card, it swaps with its immediate neighbour and persists its destination position.
- **Horizontal append:** When left/right moves a card to an adjacent column, it is appended, preserving existing behavior.
- **Drag insertion:** When a card is dragged over a valid midpoint gap and released, it appears at that exact column/index and persists after refetch and reload.
- **Empty-column drop:** A card can be dropped into an empty column at position zero.
- **Invalid/cancelled drop:** Releasing outside a valid drop target restores the original arrangement and sends no move request.
- **Same-position drop:** Dropping at the source position is a no-op.
- **Click preservation:** A click/select action still works when no movement threshold is crossed.
- **Keyboard parity:** Buttons and keyboard controls provide up/down/left/right movement without dragging.
- **Celebration:** A valid local transition from an earlier column into the last column starts board-level confetti; leaving and re-entering starts it again; same-column reorder in the last column does not.
- **Failure:** If persistence fails, the board restores/refetches server-authoritative data and shows an explicit error; any already-started confetti remains visible.
- **Concurrent updates:** If multiple users move cards concurrently, the final server order after the successful response/refetch is authoritative; no client merge or conflict-resolution UI is required.

### Manual checklist

- Verify with a desktop mouse and keyboard.
- Verify cards remain clickable/selectable.
- Verify the live card-sized gap appears before, between, and after cards and in empty columns.
- Verify touch and smartphone behavior is not part of the acceptance scope.
