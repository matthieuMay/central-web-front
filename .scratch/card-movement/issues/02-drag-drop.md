Type: grilling
Status: ready-for-human

## Question

Confirm how drag-and-drop selects an insertion point and whether to stay dependency-free.

The current UI has no draggable Cards or drop targets. The API accepts an exact zero-based destination position, so the UI must translate pointer location into that index. The requested cross-Column move is limited to adjacent Columns and includes empty Columns.

Should a drop over a Card insert before/after it based on the pointer's vertical midpoint, a drop below the last Card append, and a drop into an empty Column use position 0? Should desktop/native browser drag-and-drop be the first implementation, with a focused touch/accessibility prototype before adopting any DnD package?

### Recommendation

Use the nearest Card midpoint to choose before/after; whitespace after the last Card appends; an empty Column accepts position 0. Keep cross-Column dragging adjacent-only. Avoid a new package initially, but prototype touch behavior and keyboard parity before treating native HTML drag events as sufficient for the responsive board.

### Risks

Native HTML drag events may not provide reliable touch behavior. Drop targets can flicker or reorder repeatedly while hovering; index calculations can be off by one when source and destination are the same Column. Empty Columns need an explicit target independent of Card targets.