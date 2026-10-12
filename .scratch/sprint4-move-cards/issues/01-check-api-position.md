# 01: Check how the API handles `position`

**What to build:** before any move code relies on `position`, find out how the local API (`http://localhost:3000`) really behaves for `PUT /cards/:cardId`, and record it so later tickets compute indexes correctly. No application code changes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] With curl, record the result of a PUT with no `position` (expected: card goes to the end).
- [ ] Record the result of a `position` larger than the target column length.
- [ ] Record the result of a negative `position`.
- [ ] Record a same-column move (e.g. first card to `position` = last index after removal) and confirm the "index after removing the card" rule from the spec.
- [ ] Confirm the response is the full `BoardData` and that a reload (GET board) shows the same order.
- [ ] Results written in the Fog section of the map (or moved to Decisions so far if settled); the board data is restored to its initial order afterwards.
