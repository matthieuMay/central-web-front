# 01: Check how the API handles `position`

**What to build:** before any move code relies on `position`, find out how the local API (`http://localhost:3000`) really behaves for `PUT /cards/:cardId`, and record it so later tickets compute indexes correctly. No application code changes.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] With curl, record the result of a PUT with no `position` (expected: card goes to the end).
- [x] Record the result of a `position` larger than the target column length.
- [x] Record the result of a negative `position`.
- [x] Record a same-column move (e.g. first card to `position` = last index after removal) and confirm the "index after removing the card" rule from the spec.
- [x] Confirm the response is the full `BoardData` and that a reload (GET board) shows the same order.
- [x] Results written in the Fog section of the map (or moved to Decisions so far if settled); the board data is restored to its initial order afterwards.

## Answer

All results are in the map, under "Decisions so far → API behaviour (decision 19)".

- Without `position`, the card goes to the end of the column. Success returns the full `BoardData`, and the new order persists on a fresh GET.
- The "index after removing the card" rule is confirmed: the valid range is `0..(target length without the card)`.
- Out-of-range positions (too large or negative) get 400 `Position out of range`. Non-integers get 400 `Position must be an integer`. The API never clamps or rounds, and a failed request changes nothing.
- The board was restored to its starting order: backlog `[card-1, card-2, card-3]`, doing `[card-5, card-4]`, review `[]`, done `[card-6]`.
