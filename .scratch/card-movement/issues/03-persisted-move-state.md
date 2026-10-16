Type: grilling
Status: ready-for-human
Blocked by: 01, 02

## Question

Confirm the shared client move contract, optimistic ordering, and failed-PUT behavior.

The API already implements `PUT /cards/:cardId` with required `column` and optional integer `position`; position is zero-based after removing the moving Card. It validates range and same-board membership, compacts ordering in a transaction, returns the updated Board, and has tests for append, same-Column reorder, invalid positions, concurrent moves, and persistence after restart. A cross-Column insertion at a non-empty explicit position is not directly asserted by the current API test.

The client already has `moveCard` and `useMoveCard`, but the mutation input has no position, the request omits position, and its optimistic reducer always appends. The shared write ledger serializes writes, rolls failed writes back, and invalidates/refetches after a batch; no component currently calls the hook.

Should all movement paths use one index-aware move operation, send the exact `position`, optimistically splice into that index, and reuse the existing rollback/refetch ledger while visibly reporting failure? Should the API test add explicit cross-Column insertion into a non-empty destination as a regression case?

### Recommendation

Use a single `MoveCardInput` carrying `cardId`, `columnId`, and a zero-based target position; keyboard Left/Right uses destination length, Up/Down uses the adjacent index, and drag uses its calculated insertion point. Reuse the existing mutation scope and ledger; on failure restore cached order, refetch authoritative board state, and show an accessible error. Add the missing cross-Column/non-empty-position API assertion before relying on the frontend path.

### Risks

If the optimistic reducer interprets same-Column indices before removing the Card, it will disagree with the API. Ignoring the returned Board is safe only while final invalidation/refetch remains reliable. A failed move must not leave Card order or selected-card location stale.