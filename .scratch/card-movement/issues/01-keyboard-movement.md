Type: grilling
Status: ready-for-human

## Question

Confirm the keyboard interaction and boundary rules for a selected Card.

The current Card is a non-focusable article and has no movement UI. A previous request established click-to-select, reclick-to-unselect, Left/Right movement to the adjacent Column with the Card appended at its end, plus visible move-left/move-right buttons while selected. The new scope adds Up/Down reordering within a Column.

Should the selected Card remain selected after a move, Up/Down move it exactly one position, and movement stop without wrapping at the first/last Column or first/last Card? Should Enter/Space also toggle selection when the Card itself is focused, while arrows in editable controls do not move it?

### Recommendation

Keep one selected Card in Board state; retain selection through movement; make Left/Right move one adjacent Column and append; make Up/Down move one index within the current Column; do not wrap; make boundary actions no-ops; support keyboard focus/Enter/Space selection; do not intercept arrows from inputs or other interactive controls. Announce successful moves and failures through a polite live status/error.

### Risks

Without a focus model, global arrow listeners can steal text navigation or cause repeated moves. Reordering can unexpectedly lose selection/focus if Card keys or DOM nodes are replaced.