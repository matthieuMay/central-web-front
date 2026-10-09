# Sprint 5: Richer Cards (Members, Comments, Checklists, and API Contract)

- **API & Data Contract**:
  - Use `GET /users` to fetch available members for assignees and comment authors.
  - Use `PATCH /cards/:cardId` with `CardCollections` payload structure:
    - `assignees`: string array of assigned user identifiers.
    - `comments`: array of objects (`user`, `comment`, `createdAt`). Do not send `createdAt` for new comments; preserve existing ones.
    - `checklistItems`: array of objects (`description`, `done`). Note: no item IDs provided by API.
  - Caution: `PATCH` replaces entire sent lists; ensure existing data is not lost when appending comments or checklist items.
- **Features Implementation**:
  - **Members**: Assign and remove members from a card using the `GET /users` list.
  - **Comments**: Display activity/comments and implement a form to post a new comment with a selectable author.
  - **Checklists**: Create checklist tasks, check and uncheck them.
- **Validation**:
  - Run `npm run lint` and `npm run build` to ensure zero errors and correct build output.
  - Do not implement until explicit go-ahead.