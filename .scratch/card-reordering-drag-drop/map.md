## Destination

Produce a resolved implementation map for adding keyboard/button vertical card reordering and mouse drag-and-drop card placement to the Mini-Trello board, ready for implementation without unresolved behavioral or technical decisions.

## Notes

Frontend board work is in `src/components/` and `src/pages/`; ordering is persisted by the existing Board / Column / Card API through card position. Use the repository vocabulary from `central-web-api/CONTEXT.md`. The implementation must use `react-dnd` for mouse drag-and-drop, preserve existing horizontal movement, and remain scoped to the board.

## Decisions so far

- [Vertical reordering semantics](issues/01-vertical-reordering-semantics.md): Vertical controls swap the selected card with its adjacent neighbor and preserve selection/focus.
- [Drag-and-drop placement](issues/02-drag-drop-placement.md): The shadow marks the exact above/below insertion slot, with empty/end drops appending.
- [Persistence and regression validation](issues/03-persistence-and-regression-validation.md): Persist column and position through the existing move endpoint, add API ordering coverage, and validate frontend interactions with build/lint and browser testing.

## Not yet specified

- Implementation can now proceed from the resolved movement, placement, persistence, and validation decisions.

## Out of scope

- Changes to card fields, column management, board layout, or unrelated navigation/theme behavior.
