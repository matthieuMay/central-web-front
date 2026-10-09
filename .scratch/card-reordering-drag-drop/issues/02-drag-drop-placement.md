Type: prototype
Status: resolved
Blocked by:

## Question

What precise `react-dnd` interaction model should represent dragging only within board space, calculate insertion positions above/below cards, handle empty columns and same-column downward moves, and render the placement shadow without interfering with card selection or editing?

## Answer

The placement shadow represents the exact final insertion slot: above or below the card under the pointer. Dropping into an empty column or into blank space after the last card appends the dragged card at the end. Dragging remains limited to board space and must not interfere with selection or editing.
