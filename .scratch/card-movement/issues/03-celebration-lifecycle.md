Type: grilling
Status: resolved

Blocked by: 01

## Question

What exact celebration lifecycle should the implementation specify when a successful move transitions a card from any earlier column into the last column, including repeated leave-and-re-enter transitions, same-column reordering in the last column, failed writes, rapid successive moves, and reduced-motion preferences?

## Answer

Trigger the existing confetti celebration immediately after a valid local arrow move or drag-and-drop completes when the card transitions from any earlier column into the last column. Do not wait for server confirmation. A same-column reorder while the card is already in the last column does not trigger confetti.

Every re-entry qualifies, so a card that leaves the last column and later returns celebrates again. Each qualifying transition may create its own burst, including when several cards enter close together; bursts are not suppressed or coalesced. Mount the existing Confetti component at board level and retain its current short-lived animation.

If persistence later fails, roll the card back to the authoritative board state but leave the already-started confetti visible. Reduced-motion behavior is out of scope for this effort.
