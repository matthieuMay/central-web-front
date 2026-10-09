# Order-persistence contract research

## Scope and sources

The ticket asks for the contract that persists a card's destination column and insertion order. The frontend README identifies the API as a separate teacher-provided repository (`central-web-api`), so the backend implementation and its tests are the primary contract sources. No external web sources were used.

## Repository facts

- The frontend's current move request sends only `{ column }`: `C:\Users\david\Documents\GitHub\central-web-front\src\api\board.ts:35-41`. It cannot currently express an insertion index.
- The current frontend movement implementation only computes adjacent-column moves and calls `move.mutate({ cardId, column: destination.id })`: `C:\Users\david\Documents\GitHub\central-web-front\src\pages\BoardPage.tsx:40-51`. The buttons are only Move left/Move right (`:74-75`); there is no current up/down or drag placement contract in this snapshot.
- The frontend README says the API is the separate functional API and that the old GET-only starter is insufficient: `C:\Users\david\Documents\GitHub\central-web-front\README.md:7-19`. It also records that writes are serialized in one TanStack mutation scope and final ordering is reconciled by board invalidation: `:46-46`.
- The API route is `PUT /cards/:cardId`. Its JSON body permits exactly `column` and optional `position`; `column` must be a non-empty string, and `position`, when present, must be a safe integer. It delegates to `store.move`: `C:\Users\david\Documents\GitHub\central-web-api\src\app.ts:101-106`.
- The API README defines `position` as zero-based storage order, says omitting it appends, and says supplying it inserts at that zero-based index after removal: `C:\Users\david\Documents\GitHub\central-web-api\README.md:24-24` and `:116-118`.
- The store removes the moving card from the source sequence, treats omitted position as the destination length (append), validates `0 <= position <= destination length`, inserts the card at that index, and rejects out-of-range positions with 400: `C:\Users\david\Documents\GitHub\central-web-api\src\db\store.ts:158-168`.
- Card order is read from persisted `cards.position`, with `id` as a deterministic tie-breaker; board responses therefore expose the persisted order as `columns[].cards[]`: `C:\Users\david\Documents\GitHub\central-web-api\src\db\store.ts:76-85` and `:173-173`.
- A move rewrites contiguous positions in the source and destination lists and updates `column_id` plus `position` for destination cards: SQLite path `C:\Users\david\Documents\GitHub\central-web-api\src\db\store.ts:175-190`; async/Postgres path `:193-210`. The transaction returns a complete authoritative board (`:217-217`).
- The move verifies both card and destination column exist (404), and verifies the source and destination belong to the same board (400): `C:\Users\david\Documents\GitHub\central-web-api\src\db\store.ts:178-184` and `:195-201`. The route's unknown-card behavior and invalid-body/position behavior are exercised by `C:\Users\david\Documents\GitHub\central-web-api\tests\api.test.ts:236-249`.
- The API tests prove append into an empty column, arbitrary insertion at positions 0 and 1, same-column reordering, and persistence after restart: `C:\Users\david\Documents\GitHub\central-web-api\tests\api.test.ts:250-299`. They also issue two concurrent moves and require both to survive in the final order (`:275-282`).
- For Postgres, the move locks the board row before reading/recalculating order, so simultaneous moves are serialized against current order: `C:\Users\david\Documents\GitHub\central-web-api\src\db\store.ts:193-210`. The SQLite implementation performs the equivalent read/rewrite inside a transaction (`:175-190`). There is no client version, ETag, or explicit conflict response in this contract.
- Storage has `cards.column_id` plus integer `cards.position` in both dialects: `C:\Users\david\Documents\GitHub\central-web-api\src\db\schema.ts:17-28` and `C:\Users\david\Documents\GitHub\central-web-api\src\db\schema.postgres.ts:17-28`; migrations define the same fields at `C:\Users\david\Documents\GitHub\central-web-api\drizzle\sqlite\0000_thankful_famine.sql:6-12` and `C:\Users\david\Documents\GitHub\central-web-api\drizzle\postgres\0000_majestic_silverclaw.sql:6-12`.

## Failure and concurrency behavior evidenced by source

1. Malformed JSON is 400; unknown card or column is 404; non-integer/out-of-range position and cross-board destination are 400. The route also maps database uniqueness conflicts to 409 and unexpected errors to 500: `C:\Users\david\Documents\GitHub\central-web-api\src\app.ts:101-106` and `:108-119`.
2. The move's order calculation and all position/column updates occur inside one transaction. A failed validation occurs before updates, so the intended observable behavior is no partial reorder. The tests explicitly compare the board before and after invalid moves: `C:\Users\david\Documents\GitHub\central-web-api\tests\api.test.ts:235-247`.
3. There is no optimistic concurrency token. Concurrent requests are serialized by the backend transaction (explicit board-row lock for Postgres); each request computes its index against the order it reads. Therefore an index is not a permanent card-relative anchor: a later request may legitimately apply its requested numeric index to the then-current list. The source does not promise conflict detection or rejection for stale positions.
4. The endpoint returns the full updated board, and the frontend currently chooses to invalidate/refetch rather than place the mutation response directly into cache: `C:\Users\david\Documents\GitHub\central-web-front\src\api\mutations.ts:88-95`. This gives all board viewers a canonical order on their next GET, but live push/update behavior is not specified.

## Unresolved contract questions

- Should the later frontend specification adopt the existing `position` integer directly, or use a card-relative anchor (`beforeCardId`/`afterCardId`) to make concurrent drag intent clearer? The available backend only supports the numeric index.
- Is zero-based indexing after removal the required public meaning for same-column moves? The backend implementation and README say yes, but the frontend ticket does not yet state it.
- Should omitted `position` remain the explicit append operation for keyboard left/right, while drag always sends a position (including `0` and the destination length)?
- What should the UI do on 400/404/500 after optimistic drag/up/down movement: restore the pre-move board, refetch, or show a conflict-specific retry? Existing frontend behavior shows an error and relies on mutation/refetch behavior, but does not define drag rollback.
- Is last-write-wins under serialized transactions acceptable for two viewers moving cards concurrently, or is version/conflict detection required? No version field, ETag, or 409 conflict contract exists in the available backend.
- Does the API guarantee that every successful response is immediately visible to all readers, or only durable on subsequent GET? The tests prove restart persistence, but there is no push/subscription contract.
- What is the intended behavior for a same-position drop? The backend accepts it and rewrites the same logical order; the ticket says it should be a frontend no-op, so the frontend should avoid sending it.

## Recommended contract for the later specification

Use the existing backend contract rather than inventing a new endpoint:

```http
PUT /cards/:cardId
Content-Type: application/json

{ "column": "<destination-column-id>", "position": <zero-based-index-after-removal> }
```

- `column` is required and must identify a column on the card's board.
- `position` is an optional safe integer. Omit it to append; otherwise insert at the zero-based index in the destination list after removing the card from its source. Allow `0` through the destination list length inclusive, including empty destinations.
- Treat successful response body (the complete updated board) as authoritative, or refetch `GET /boards/:boardId` immediately after success. Do not optimistically assume a stale numeric index is still valid after another move.
- Perform no request for same-column same-index drops. For keyboard left/right, send the destination column and omit `position` to preserve append semantics. For up/down and arbitrary drag, send the computed destination column and explicit position.
- Define 400/404 as rejected moves with no partial reorder; define 500/network failure as failed writes requiring rollback/refetch and retry UI. Until the API grows a version token, document concurrency as serialized, durable last-write-wins with no stale-write conflict detection.
- If stronger collaboration semantics are required, add an explicit board revision/ETag or anchor-based operation as a separate backend change; it is not supported by the current API and should not be assumed by the frontend specification.
