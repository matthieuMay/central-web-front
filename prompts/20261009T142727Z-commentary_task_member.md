# Implement Commentary, Task, and Member components

Implement the three currently empty frontend components `Commentary`, `Task`, and `Member` in the existing Mini-Trello
application. Treat the requirements below as the source of truth. Inspect the repository first and reuse its existing
React Query, Chakra UI, accessibility, error-feedback, and card-movement patterns instead of introducing parallel patterns.

## Backend contracts

Use these routes and preserve their responsibilities:

- `GET /users` returns the users that can be assigned to a card.
- `GET /boards/mini-trello` returns the board and, on every card, these persisted collections:

```ts
type CardCollections = {
  assignees: string[]
  comments: {
    user: string
    comment: string
    createdAt: string
  }[]
  checklistItems: {
    description: string
    done: boolean
  }[]
}
```

- `PATCH /cards/:cardId` persists partial card changes, including `CardCollections`.
- Keep the existing card movement contract and behavior separate. Do not replace the existing `PUT /cards/:cardId` flow used
  for manual drag-and-drop and keyboard movement.

Expand the frontend card types and board query handling to represent these collections. Do not silently invent a different API
shape. If the backend currently rejects the expanded PATCH payload, surface that incompatibility clearly rather than losing
unrelated collection data.

## Commentary

Build a card-level comment area with the following behavior:

1. Clicking the text input activates comment editing.
2. The user enters an author for this comment and the comment text. The author is required and is stored as `comments[].user`;
   do not assume a global current-user/session endpoint.
3. Submission is explicit through a visible submit button or `Ctrl+Enter`.
4. Do not create or persist a comment on focus, on every keystroke, or when the user merely clicks the input.
5. Reject empty or whitespace-only author/comment values with accessible validation feedback.
6. On successful submission, append the comment with an ISO timestamp in `createdAt`, persist it through
   `PATCH /cards/:cardId`, clear the editor, and render the saved comment on the card.
7. A draft that is cancelled, abandoned, or lost on page refresh must not appear in the saved comments.
8. Render existing comments from board data, including author and timestamp, with accessible structure.
9. Show pending and error states. On a failed write, keep the draft available for retry and do not drop existing comments.
10. Ensure the comment controls do not accidentally trigger card selection or drag behavior.

## Task

Build checklist-item controls for `checklistItems`:

1. Render each item's description and completion state as an accessible checkbox.
2. Clicking the checkbox toggles only that item's `done` value and persists the complete updated checklist through
   `PATCH /cards/:cardId`.
3. Preserve item order and descriptions. Do not overwrite comments or assignees while updating a checklist item.
4. Provide pending and error feedback. If persistence fails, restore the previous checked state and explain how to retry.
5. When every checklist item is complete, automatically move the card to the board's treated/completed column using the existing
   movement mutation/flow. Discover the destination column from board data; never hardcode a column id.
6. Define the empty-checklist behavior explicitly and safely: an empty checklist is not considered “all tasks complete” and must
   not trigger an automatic move.
7. Prevent duplicate automatic moves while a collection update or card move is already pending.
8. Keep checklist persistence and card movement coordinated so a failed checklist update does not move the card, and a failed move
   reports an actionable error without losing the successfully saved checklist state.
9. Do not add member assignment fields to checklist items. Task owns checklist completion only; Member owns card-level assignees.

## Member

Build card-level member assignment controls:

1. Load selectable users from `GET /users` using the repository's query/cache conventions.
2. Clicking the add control opens an accessible user-selection UI. It must be possible to add or remove any selected user;
   this is independent of the author entered for a comment.
3. Persist the resulting `assignees` array through `PATCH /cards/:cardId`.
4. Render each selected user as a compact avatar/badge. Use the user's available id/name/photo fields according to the actual
   `GET /users` response and provide a tooltip or accessible name containing the user's name.
5. Show at most three individual member avatars. If more are assigned, show a `+N` affordance that exposes the remaining
   members accessibly; do not discard them from persisted data.
6. Support keyboard access and clear focus behavior for opening the selector, choosing a user, removing a user, and closing it.
7. Show pending and error states. On a failed update, restore the previous assignment state and preserve all unrelated card data.
8. Keep the layout bounded so avatars and controls do not overflow the card at normal and narrow widths.
9. Ensure member controls do not trigger card selection or drag behavior unintentionally.

## Shared implementation requirements

- Follow existing component naming, prop typing, API helper, mutation, query invalidation, optimistic rollback, and error
  notification conventions. Prefer proper types and guards over unsafe casts.
- Keep updates surgical and preserve existing card title/description editing, drag-and-drop, keyboard movement, focus restoration,
  and confetti behavior.
- Treat PATCH collection writes as updates to the full relevant collection. Merge from the latest card state so a comment,
  checklist, or assignee update cannot accidentally erase another collection.
- Reconcile successful writes with the authoritative board query. Use explicit loading, success, and error semantics; do not use
  silent fallback data.
- Add focused tests for:
  - explicit comment submission, author/comment validation, Ctrl+Enter, and draft abandonment;
  - checklist toggling, rollback, empty-checklist behavior, and automatic completion move;
  - member selection/removal, the three-avatar `+N` presentation, persistence, and keyboard accessibility;
  - preservation of unrelated card collections across each mutation.
- Validate the smallest relevant test/type-check/build commands used by the repository and report any backend contract mismatch
  explicitly.

## Acceptance criteria

The implementation is complete only when:

- A comment survives a page refresh only after explicit submission and includes the entered author.
- An abandoned comment draft never appears in board data.
- Checklist state survives refresh, preserves ordering/content, and an all-complete non-empty checklist moves the card exactly once
  to the board's treated/completed column.
- A failed checklist write cannot cause an automatic move.
- Users can assign and remove members independently of comment authors, and all assignments survive refresh.
- No more than three individual member avatars are shown, with an accessible `+N` representation for the rest.
- Existing card movement and editing behavior remains unchanged.
- Loading, validation, and failure states are visible and accessible, with no silent data loss.
