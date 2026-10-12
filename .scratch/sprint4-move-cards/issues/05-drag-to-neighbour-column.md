# 05: Drag and drop into a neighbouring column

**What to build:** the user can drag a card into the column directly to the left or right and drop it at the place shown by the placeholder, including into an empty column. Columns further away refuse the drop.

**Blocked by:** 04 (Drag and drop within one column, with a placeholder)

**Status:** ready-for-agent

- [ ] Dragging over a neighbouring column shows the placeholder between its cards; dropping inserts the card there; reload keeps it.
- [ ] An empty neighbouring column shows the placeholder and accepts the drop (`position` = 0).
- [ ] A column two or more steps away shows no placeholder, shows a not-allowed cursor, and sends no request on drop.
- [ ] Leaving a column removes its placeholder; only one placeholder is visible at a time.
- [ ] A blocked PUT rolls the card back to its original column and place with the error message.
- [ ] `npm run lint` and `npm run build` pass.
