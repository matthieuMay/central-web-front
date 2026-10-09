Type: grilling
Status: resolved
Blocked by:

## Question

What exact ordering and focus semantics should vertical keyboard/button movement use, including the first/last-card boundaries, same-column API position values, and behavior while a move is pending or editing is active?

## Answer

Move up and Move down, including ArrowUp and ArrowDown, swap the selected card with its immediate neighbor. At the first and last positions the corresponding action is unavailable. After a successful move, the card remains selected and receives focus. Movement is unavailable while another move is pending or while card editing is active.
