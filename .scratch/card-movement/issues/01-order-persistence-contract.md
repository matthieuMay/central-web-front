Type: research
Status: resolved

## Question

What server/API contract should represent a card's destination column and insertion order so left/right append, up/down swaps, and arbitrary drag-and-drop placement persist across reloads and board viewers? Identify the available backend contract or, if it is outside this repository, the precise frontend-to-backend contract that must be agreed before implementation, including failure and concurrency behavior.

## Answer

The frontend currently sends `PUT /cards/:cardId` with `{ column }`; omitting an order value appends the card to the destination column. The backend supports extending this payload with a zero-based safe-integer `position`:

```json
{ "column": "<destination-id>", "position": 0 }
```

`position` is interpreted after the source card is removed. The backend rewrites positions transactionally and reads sort by persisted position, so the frontend can use the same contract for adjacent swaps and arbitrary drag insertion. Existing left/right calls should omit `position` to preserve append behavior; up/down and drag-and-drop should send the calculated destination position.

The mutation should continue invalidating and refetching the board after success. Failed writes must not trigger celebration. There is no version/ETag/conflict token, so concurrent moves apply against the order current when each request executes; conflict resolution is therefore last successful request/order rather than client-side merge.

Research details are recorded in [order-persistence-contract-findings.md](../research/order-persistence-contract-findings.md).
