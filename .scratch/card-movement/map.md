## Destination

An implementation-ready specification for mouse-and-keyboard card movement: up/down ordering, drag-and-drop placement with insertion preview, and confetti when a card enters the last column.

## Notes

Domain: board, column, and card movement in the current frontend.

The agreed product constraints are:

- Up/down swaps a card with its immediate neighbour; boundary actions do nothing.
- Left/right keeps the existing append-to-destination-column behavior.
- Mouse drag-and-drop may target any column and insertion point, including empty columns.
- Drag-and-drop must use React DnD.
- Invalid drops cancel; same-position drops are no-ops.
- Keyboard and buttons remain a complete alternative to dragging.
- Touch devices are out of scope.
- Order must persist on the server.
- Confetti is triggered after a move into the last column, including when a card leaves and later re-enters; reordering inside the last column does not trigger it.

## Decisions so far

- [Order persistence contract](issues/01-order-persistence-contract.md): use the existing card-move endpoint with optional zero-based `position`; omission preserves append behavior, while positioned writes are transactional and concurrency is last successful request.
- [Drag interaction contract](issues/02-drag-interaction-contract.md): React DnD desktop dragging starts after an intentional threshold, previews a live card-sized midpoint-based gap, and cancels invalid releases without fallback placement.
- [Celebration lifecycle](issues/03-celebration-lifecycle.md): trigger board-level existing confetti after each local transition into the last column, including re-entry; do not trigger for same-column reorder, and leave early confetti visible if persistence fails.
- [Acceptance scenarios](issues/04-acceptance-scenarios.md): verify arrow boundaries, positioned persistence, React DnD placement/cancellation, keyboard and click parity, explicit error recovery, desktop scope, and confetti transitions with Given/When/Then plus manual checks.

## Not yet specified

- The implementation itself: the map is ready for handoff once the agreed scenarios are used to build and verify the feature.

## Out of scope

- Touch and smartphone drag-and-drop support.
- Reduced-motion-specific celebration behavior.
