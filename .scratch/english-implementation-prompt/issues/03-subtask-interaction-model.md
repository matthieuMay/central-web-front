Type: grilling
Status: resolved
Blocked by: 01-subtask-data-contract

## Question

What exact interaction model should the prompt require for the `+ New task` placement, the double-arrow drag handle, the right-side overflow menu, delete confirmation, keyboard accessibility, and preserving the existing main-card drag behavior?

## Answer

`+ New task` inserts an inline editable subtask at the end of the list, or directly below the main-task title when the list is empty. Focus the title input immediately. Enter saves, Escape cancels, blank titles are rejected, and persistence failures keep the draft visible with explicit retryable feedback.

Only the dedicated double-arrow up/down handle starts a subtask drag. The handle has an accessible **Reorder subtask** label and a visible drag state. Reordering updates the UI optimistically, persists the complete ordered array, and rolls back on API failure. Existing main-card drag behavior remains unchanged.

The three-dot button on each subtask opens an accessible per-subtask menu with **Delete**. Delete always requires confirmation. The menu closes on Escape or outside click, and menu/handle events do not select or drag the main card. Failed deletion keeps the item available and reports a retryable error.

Checkboxes toggle subtask completion and persist the ordered array. The main task keeps the existing automatic move rule: it moves to the completion column only when there is at least one subtask and every subtask is complete. An empty list is not complete.
