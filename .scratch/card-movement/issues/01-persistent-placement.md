# Persist precise placement and preserve optimistic writes

Labels: wayfinder:research
Type: research
Status: resolved
Assignee: persistence-research
Blocked by: none

## Question

Does the documented sibling API support persistent same-column and cross-column insertion, what exactly is its index/validation contract, and how can movement reuse the frontend's existing optimistic write ledger without losing create/edit changes on failure?

Verify source and existing API tests as well as README. Identify the smallest frontend change, pending-operation policy and acceptance checks; do not implement application code.

## Assets

- Findings: [persistence.md](../research/persistence.md).

## Answer

The sibling API already persists optional safe-integer `position` on PUT, interpreted after removing the card. Same-column reorder and empty-column insertion work; omitted position appends. Valid indices are `0..destinationLengthAfterRemoval`, inclusive. GET returns persisted array order; invalid moves leave the board unchanged in the inspected tests.

Reuse the frontend's `begin`/`rollback`/`settle` ledger for movement, preserving full card objects and later optimistic create/edit writes. Keep the serialized board-write scope, but reject a new move while any board-write mutation or reconciliation read is pending. Creates/edits can remain available during an accepted move. Scope serialization alone is insufficient because queued `onMutate` runs before its HTTP request; indexed movement must not depend on an earlier tentative write. Recheck eligibility and current index at drop.

Separate PUT failure/rollback from failed reconciliation after PUT success. Track focus and visual arrival by operation/card identity; user-decided confetti fires once at forward visual arrival even while PUT remains pending and even if it later fails. Failure animates back without another burst; no rollback/no-op/refetch celebration. HTTP success does not gate confetti.

Full primary-source findings and acceptance checks: [persistence.md](../research/persistence.md).

Inspection only: no application changes or database-write tests. Deployed API parity and live integration remain unverified.
