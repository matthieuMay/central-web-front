## Destination

Produce a precise English implementation prompt for a coding agent to update the Mini-Trello frontend. The prompt must capture the agreed product behavior, domain model, API integration, interaction details, accessibility requirements, and validation expectations without implementing the changes in this wayfinding session.

## Notes

Domain: React/TypeScript Mini-Trello board UI. Consult the existing board types, API query/mutation conventions, Chakra UI patterns, and current component behavior. Keep the prompt implementation-ready and preserve explicit loading/error feedback. This map is planning-only; implementation happens after the prompt is handed off.

## Decisions so far

<!-- Closed decision tickets will be indexed here. -->

- [Define subtask data contract](./issues/01-subtask-data-contract.md): Cards use ordered first-class subtasks with stable ids, titles, completion state, and full-array PATCH persistence.
- [Define session and comment author](./issues/02-session-comment-author.md): Require an in-memory user-or-anonymous choice, support top-right switching, normalize names centrally, and block anonymous commenting.
- [Define subtask interaction model](./issues/03-subtask-interaction-model.md): Add inline creation, handle-only reorder with rollback, accessible overflow deletion with confirmation, and completion-driven card movement.
- [Define components, colors, and validation](./issues/04-components-colors-validation.md): Preserve Task as integration boundary, extract focused subtask/session surfaces, standardize accessible buttons and colors, and require focused regression validation.

## Not yet specified

- No remaining decisions are currently specified.

## Out of scope

- Implementing the requested frontend changes during this wayfinding session.
- Adding backend endpoints or changing backend persistence beyond documenting the contract the frontend needs.
- Adding unrelated board features, authentication, permissions, or a full visual redesign.
