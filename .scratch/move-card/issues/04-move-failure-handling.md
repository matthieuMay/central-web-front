# 04 — What happens when a Move fails

Type: grilling
Blocked by: None

## Question

Define failure behaviour for an optimistic Move when `PUT /cards/:cardId` fails (network error, `400 Position out of range`, `404 Card/Column not found`):

- **Rollback:** restore the pre-Move cache exactly, or re-fetch the Board?
- **Feedback:** toast, inline message, screen-reader announcement, or silent?
- **Retry:** automatic, manual, or none?
- **Concurrency:** under rapid successive Moves, do we cancel in-flight mutations, queue them, or keep last-write-wins? What happens when responses arrive out of order?

State explicitly whether any of this is **in scope for the first slice** or deferred, and whether the same handling covers the initial `GET /boards/:id` failure (loading/error states from the spec).
