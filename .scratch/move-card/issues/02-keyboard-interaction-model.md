# 02 — Keyboard interaction and accessibility model

Type: grilling
Blocked by: 01

## Question

Define the exact keyboard model for Moving a Card:

- How a Card becomes **selected**: focus only, or a distinct selected state; is selection a "grab/lift" (dnd-kit style) or a **direct arrow Move**?
- Which element holds focus, and where focus lands after a Move (following the Card, or staying put).
- Roles, labels, and screen-reader announcements (`aria-live`) for "Card selected", "moved to <Column> at position N", and impossible Moves.
- How `Escape` and clicking elsewhere clear selection.
- How `←`/`→` into an empty Column reads, given Position preservation clamped to length 0.

This must reconcile the objective's "select a Card, then arrows" with whatever mechanism research ticket 01 recommends (dnd-kit sensor vs explicit key handlers), and keep the board operable without a pointer.
