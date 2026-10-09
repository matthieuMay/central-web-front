# Detailed card information

Status: ready-for-agent

## Problem Statement

Cards currently show only their title and optional description. Board users
cannot see or manage who is working on a card, track its checklist, or review
its comments in context.

## Solution

Expand a card inline within its column from a dedicated Details button. The
expanded area shows and supports managing card assignees and checklist items,
and displays the card's comments. The collapsed card keeps a compact summary of
its assignees, checklist progress, and comment count. Existing card movement
continues to work independently of the detail controls.

## User Stories

1. As a board user, I want to load the Mini-Trello board from the board API, so
   that I see the current server-owned board and card details.
2. As a board user, I want to expand a card's details inline in its column, so
   that I can inspect and update details without navigating away from the
   board.
3. As a board user, I want a dedicated Details button on each card, so that
   opening details does not interfere with dragging the card.
4. As a board user, I want to collapse an expanded card, so that I can return
   to the compact board view.
5. As a board user, I want to see assigned usernames on a collapsed card, so
   that I can quickly tell who is responsible for it.
6. As a board user, I want to see checklist completion progress on a
   collapsed card, so that I can assess its status without expanding it.
7. As a board user, I want to see a comment count on a collapsed card, so that
   I know whether the card has discussion to review.
8. As a board user, I want to see all assigned users in the expanded card, so
   that I can review its full set of members.
9. As a board user, I want to add multiple users to a card, so that shared
   responsibility is represented.
10. As a board user, I want to remove a user from a card, so that assignments
    can be kept current.
11. As a board user, I want to choose assignees from the users available in
    the system, so that card assignments refer to known users.
12. As a board user, I want to add checklist items to a card, so that I can
    break work into trackable steps.
13. As a board user, I want to edit a checklist item's description, so that I
    can correct or clarify its work.
14. As a board user, I want to mark a checklist item done or not done, so that
    progress can be updated as work changes.
15. As a board user, I want to remove a checklist item, so that obsolete steps
    no longer appear.
16. As a board user, I want to read a card's comments and their authors and
    timestamps, so that I can understand the discussion history.
17. As a board user, I want to select the author when posting a comment, so
    that every new comment has an explicit author.
18. As a keyboard user, I want to open, use, and close card details with
    keyboard-operable controls, so that I can manage the card without a mouse.
19. As a board user, I want card detail controls to remain separate from card
    movement, so that assigning users or editing a checklist does not
    accidentally move the card.
20. As a board user, I want card detail changes to report failures clearly, so
    that I know when an update has not been saved.
21. As a board user, I want card details and compact summaries to reflect
    successful server updates, so that the board does not present unsaved
    changes as persisted.

## Implementation Decisions

- The board is loaded with `GET /boards/mini-trello`. The returned board
  contains the cards and their detail collections.
- User choices are loaded with `GET /users`, which returns user records with
  `id`, `firstname`, and `lastname` fields. Assignee values and comment author
  values are user IDs; the frontend displays each user's full name.
- Card details are expanded inline within the column, using a dedicated
  Details button on the compact card. The collapsed card displays assigned
  usernames, checklist completion progress, and comment count.
- Multiple users can be assigned to a card. A user can be added or removed
  without replacing unrelated card details.
- Checklist items support adding, editing their descriptions, toggling
  completion, and removal.
- Comments are displayed in directly editable textareas and saved when a
  textarea loses focus. Editing changes only the comment text and preserves
  its author and creation timestamp. New comments require an explicitly
  selected author and are saved when their textarea loses focus.
- Each card has the following collections:

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

- `PATCH /cards/:cardId` is used for details. A request includes only the
  collection being changed; that collection's value is its complete updated
  array. A successful response is the updated card, which is used to replace
  that card in the current board state.
- Preserve the existing `PUT /cards/:cardId` position-update contract for
  moving cards. Detail updates use `PATCH` and do not change the move operation.
- Expanding and editing details must not break the existing drag-and-drop or
  arrow-key card movement behavior.
- Keep loading, empty, and error states explicit. If users cannot be loaded,
  communicate the failure and prevent assignment from appearing to succeed.
- Detail controls must be keyboard operable and expose accessible names and
  state. Keep focus behavior and card movement controls usable when a card is
  expanded.

## Testing Decisions

- Use the board/card UI as the highest-level test seam. Exercise rendered
  behavior with mocked API responses for the board, users, and card updates.
- Tests should verify externally observable behavior rather than component
  internals: opening and closing details, summary content, assignment changes,
  checklist operations, comments display, API request behavior, error
  feedback, and unchanged card movement.
- Verify that a detail `PATCH` contains only the changed collection and that
  the returned card is reflected in the visible board state. Verify that
  moving a card continues to use the existing `PUT` contract.
- Include keyboard interaction and accessible labeling in UI-level checks.
- The project currently has no visible test script or test setup. Add the
  smallest suitable test harness needed to exercise this board/card seam
  during implementation; do not substitute implementation-detail tests for
  user-visible behavior.

## Out of Scope

- Creating, editing, or deleting users.
- Authentication and current-user identity implementation.
- Deleting comments.
- Replacing the existing card-position `PUT` API operation.
- Adding card-detail routes or navigating away from the board to edit details.
- Other card metadata or workflows not represented by assignees, comments,
  and checklist items.

## Further Notes

- The supplied contract defines the collection fields but does not specify
  validation rules, server-side timestamp generation, comment ordering, or
  error response bodies. Editing a comment sends the full comments collection,
  retaining all unmodified comment data. Do not invent additional API
  guarantees while implementing; clarify any required behavior with the API
  owner if it blocks the work.
