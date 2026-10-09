Type: task
Status: resolved
Blocked by: 01, 02

## Question

What API/client mutation, optimistic-cache, focus restoration, and test changes are required to persist every supported reorder reliably and demonstrate that existing horizontal movement, selection, editing, and board behavior remain intact?

## Answer

Use the existing PUT card-move endpoint with an explicit destination column and position for every reorder. Preserve the existing mutation serialization, refetch reconciliation, selection, and focus restoration behavior. Add API coverage for same-column adjacent swaps and cross-column insertion. Validate the frontend with build and lint, then manually exercise keyboard, button, and drag-and-drop interactions in the browser.
