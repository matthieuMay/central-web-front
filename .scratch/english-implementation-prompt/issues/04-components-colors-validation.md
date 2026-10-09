Type: grilling
Status: resolved
Blocked by: 02-session-comment-author, 03-subtask-interaction-model

## Question

Which component boundaries, button event isolation rules, loading/error states, accessible light/dark color tokens, and focused validation scenarios should the English implementation prompt require across the three new components and their integration points?

## Answer

Keep `Task` as the card integration boundary, extract the subtask list/editor into a focused component, and expose the selected session user through a small shared session context or hook consumed by the header and comment form. Keep the existing API and React Query conventions.

Every new or repaired button must use explicit `type="button"` unless it submits a form, stop propagation when it must not select or drag the card, remain keyboard reachable, expose an accessible name, and show disabled/loading states during mutations. Apply this to subtask creation, the drag handle/menu trigger, deletion/confirmation, session switching, member controls, retries, and comment submission.

Use a restrained accessible palette compatible with light and dark modes: a clear primary-action accent, subtle distinct column/card surfaces, and semantic success/error/warning colors. Preserve the existing theme toggle rather than redesigning the application.

Require focused tests and build/type-check coverage for session choice and anonymous restrictions, `/users` name normalization, automatic comment authorship, subtask creation/validation/completion/deletion/confirmation/reorder rollback, button isolation from card selection and drag, light/dark rendering and accessible labels, existing card movement, and member assignment. Run the repository's existing validation commands.
