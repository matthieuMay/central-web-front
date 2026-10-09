## Destination

Produce one implementation-ready English prompt for a coding agent to implement the `Commentary`, `Task`, and `Member`
components in the Mini-Trello frontend, using the agreed API contracts and preserving existing card movement behavior.

## Notes

Domain: Mini-Trello cards, checklist items, comments, and member assignments.
The prompt should inspect and reuse existing React Query, Chakra UI, accessibility, and card movement patterns.
This Wayfinder effort is specification-only; it does not implement the components or backend changes.

## Decisions so far

- The prompt is a single English specification covering all three components.
- Comments are explicitly submitted, signed by a per-comment author, and abandoned drafts are not persisted.
- Checklist items are independently toggleable; when all are complete, the card moves automatically to the treated/completed column.
- Member assignment is card-level, independent of comment authors and checklist items; users are selected through `GET /users`.
- Three member avatars are shown at most, with `+N` for additional assignments.
- `GET /boards/mini-trello` supplies `assignees`, `comments`, and `checklistItems` on each card.
- `PATCH /cards/:cardId` persists those collections; existing `PUT /cards/:cardId` movement semantics remain distinct.

## Not yet specified

- The backend implementation details for accepting and validating the expanded PATCH payload must be aligned with the supplied
  `CardCollections` shape during implementation.
- The exact destination column identifier for the treated/completed column must be obtained from board data rather than hardcoded.

## Out of scope

- Implementing the React components in this session.
- Adding a separate authentication/session endpoint.
- Replacing the existing card movement API or changing drag-and-drop/keyboard movement semantics.
