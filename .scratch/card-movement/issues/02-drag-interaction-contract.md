Type: grilling
Status: resolved

Blocked by: 01

## Question

What exact mouse interaction and accessibility behavior should the implementation specify for whole-card dragging, click/select preservation, insertion-gap preview before the first card/between cards/after the last card, empty columns, invalid drops, same-position drops, keyboard alternatives, and reduced-motion users?

The drag-and-drop implementation must use React DnD. Touch and smartphone support remain out of scope.

## Answer

Use React DnD for desktop mouse dragging. Require a short pointer-movement threshold before starting a drag so ordinary clicks still select/open the card and card controls remain usable.

While dragging, keep the source represented by a visible card-sized insertion gap. Render the dragged preview semi-transparent or otherwise visually distinct. Compute the gap from the pointer crossing each card's midpoint; it may be before the first card, between cards, after the last card, or the only target in an empty column. The preview moves live as the pointer changes insertion point.

On drop, send exactly the currently previewed column and position to the API. A release outside a valid column/list target cancels the drag and restores the original arrangement; there is no nearest-target or automatic append fallback. Dropping at the original position is a no-op. Removing the pointer from the valid target or cancelling the drag removes the gap.

The existing buttons and keyboard movement remain the non-pointer alternative. Touch and smartphone interaction are out of scope.
