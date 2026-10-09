# Move a Card

Status: ready-for-agent

## Problem Statement

The `/board` route renders a read-only Board from a static JSON file. A user can look at the Columns and Cards but cannot reorganize them: there is no drag-and-drop, no keyboard path, and no feedback when work reaches the end of the workflow. The API already supports moving and reordering Cards, but the front never calls it, so nothing the user sees is theirs to change or keep.

## Solution

The Board loads from the live API, and a user can Move a Card two ways. By keyboard: select a Card, then `←`/`→` to send it to a neighbouring Column and `↑`/`↓` to change its Position within its current Column. By drag-and-drop: reorder within a Column, or drop into another Column at the aimed spot, including an empty Column. Every Move persists through the existing `PUT /cards/:cardId` contract and survives reload. When a Move lands a Card in the Final Column, a Completion Celebration plays. Impossible Moves (past the first/last Column, past a Column's first/last Position) are no-ops rather than errors.

## User Stories

1. As a Card owner, I want to drag a Card up or down within its Column, so that I can reprioritise without re-creating it.
2. As a Card owner, I want to drop a Card into a neighbouring Column at the exact spot I aim for, so that the Card lands where I meant.
3. As a Card owner, I want to drop a Card into an empty Column, so that I can start a Column from nothing.
4. As a keyboard user, I want to select a Card, so that I can Move it without a pointing device.
5. As a keyboard user, I want `←` and `→` to send the selected Card to the neighbouring Column, so that I can change its stage.
6. As a keyboard user, I want `↑` and `↓` to change the selected Card's Position within its Column, so that I can reorder it.
7. As a keyboard user, I want a Move at the first or last Column to do nothing, so that I am never dropped into an invalid state.
8. As a keyboard user, I want a Move past the first or last Position of a Column to do nothing, so that the Card stays put rather than wrapping or vanishing.
9. As a keyboard user, I want the selected Card to be visibly selected, so that I know which Card the arrows act on.
10. As a keyboard user, I want to know which Card is selected and where it sits, even with a screen reader, so that I can navigate confidently.
11. As a keyboard user, I want a Move announced when it succeeds, so that I get the same feedback a sighted user gets from the animation.
12. As a Card owner, I want `←`/`→` to keep the Card at roughly the same row when it crosses Columns, so that the move feels like sliding sideways.
13. As a Card owner, I want a Move to appear instantly and then persist, so that the board never feels laggy.
14. As a Card owner, I want the Board to reload from the API with my Moves intact, so that my changes are durable.
15. As a Card owner, I want a failed Move to roll the Board back and tell me, so that the screen never lies about what is saved.
16. As a Card owner, I want the Completion Celebration when a Card reaches the Final Column, so that finishing work feels rewarded.
17. As a Card owner, I want no Completion Celebration when I merely reorder Cards already in the Final Column, so that the reward stays meaningful.
18. As a Card owner, I want a Move to the same Column and same Position to be a no-op, so that nothing happens when I restate the Card's place.
19. As a Card owner, I want the Board to show a loading state while it fetches and an error state if the fetch fails, so that I am not left staring at a blank board.
20. As a Card owner, I want to drag a Card by pointer or by touch, so that the same interaction works on desktop and on a phone.
21. As a keyboard user, I want the arrow behaviour to work the same whether the current Column is empty or full, so that I don't have to learn two models.
22. As a Card owner, I want the selected Card to lose selection when I click elsewhere or press `Escape`, so that I can exit the keyboard flow.

## Implementation Decisions

- **Front-only effort.** The backend contract is frozen and already implemented and tested: `PUT /cards/:cardId` with body `{"column": <destination Column id>, "position": <zero-based position after removal, optional>}`, returning the full updated `BoardData`. Omitting `position` appends to the end of the Destination Column. Same Column reorders; a different Column moves and inserts. The front consumes this contract and changes nothing server-side.
- **Board state lives in TanStack Query.** `GET /boards/:boardId` populates the query cache; a `PUT` mutation sends the Move. On success the mutation writes the returned `BoardData` straight into the cache with `setQueryData`, so the server's view is the truth. The static `data/board.json` import stops being the runtime source.
- **Optimistic Moves.** The mutation moves the Card in the cache immediately in `onMutate` (so the UI responds on the same frame) and rolls back on error; the server response then reconciles. The exact rollback and rapid-fire behaviour is an open decision (see the map's failure-handling ticket).
- **One interaction layer.** Pointer and touch drag-and-drop use `@dnd-kit/core` with the sortable preset for the multi-container Board. Whether the keyboard model rides on dnd-kit's keyboard sensor or is handled by explicit key handlers, and how selection and focus are expressed, is an open decision (see the map's keyboard-model and dnd-kit tickets).
- **Move semantics are pure.** The mapping from a gesture or keypress to `{ column, position }` is a dependency-free function: same-Column reorder adjusts for the removed Card's position; `←`/`→` preserves Position clamped to the Destination Column's length; `↑`/`↓` clamps at the Column's ends. Position is always counted after removal, per the contract.
- **Navigation is clamped, never wrapped.** Moving past the first/last Column or first/last Position is a no-op; the front does not send a request it knows the API will reject.
- **Completion Celebration.** When a Move's Destination Column is the Final Column (`board.columns[board.columns.length - 1]`) and the Card was not already in it, render the existing `Confetti` component; suppress it for reorders that stay in the Final Column. Where the effect is mounted and how the transition is detected is an open decision (see the map's celebration ticket).
- **Accessibility.** Cards are keyboard-selectable and their Moves announced; the board remains operable without a pointer. The precise roles, roving focus, and announcement wording is part of the keyboard-model decision.
- **API access.** The backend sets `CORS_ORIGIN=*`, so the front can call it directly; the base URL and how the board id is chosen are an open decision (see the map's API-access ticket).
- **Glossary.** The terms Board, Column, Card, Move, Position, Destination Column, Final Column, and Completion Celebration are defined in `CONTEXT.md`.

## Testing Decisions

- Good tests assert external behaviour through the highest seam available, never implementation details: given a Board and an input (a keypress or a drop), assert the resulting Column order and the request sent, not the internal state shape.
- Candidate seams, highest first: (1) the Board view with the query client and a mocked `fetch`/API, exercising selection, arrow Moves, drop Moves, clamping, and the Celebration; (2) the pure Move function, asserting the `{ column, position }` it computes for same-Column reorders, cross-Column clamped moves, and edge no-ops.
- Prior art: `src/color-mode.test.tsx` is the one existing test and the model to follow (Vitest + Testing Library, behaviour-first, `vi.stubGlobal` for environment seams).
- Which of these seams to build, and whether to confirm them with the human, is an open decision (see the map's testing-seams ticket). The `to-spec` process requires the humans' sign-off before implementation.

## Out of Scope

- Any backend change: the move contract is implemented and tested in `central-web-api`.
- Column reordering, Column creation/rename/delete.
- Card creation, editing, deletion, and the assignee/comment/checklist collections the API exposes; the front's `CardData` remains a projection of title and description.
- Persisting the selected Card across reloads.
- Cross-Board Moves (the API rejects them: "Card must stay on its board").
- Authentication, users, and the Home/Not-Found pages.

## Further Notes

- The Board response is the seed copied into the API; the front's `data/board.json` mirrors it and is the shape the front already renders, so no type change is expected beyond reading it from the API.
- The map for this effort lives at `./map.md`; the open decisions above are its child tickets under `./issues/`. The spec is complete for everything decided; those tickets carry the decisions still to make.
- Trade-off acknowledged: optimistic Moves can briefly show a state the server has not confirmed; the rollback path (ticket on failure handling) is what keeps that honest.
