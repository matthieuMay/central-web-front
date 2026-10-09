Before starting anything:

1. Read and follow the instructions in:
   - C:\Users\gsurl\Desktop\Web_ex1\central-web-api\AGENTS.md
   - C:\Users\gsurl\Desktop\Web_ex1\central-web-front\AGENTS.md

2. Inspect the existing frontend architecture and preserve all current behavior, including:
   - Card selection and focus management
   - Card editing
   - Keyboard card movement
   - Move left/right and move up/down controls
   - Mouse drag-and-drop ordering
   - Drop-position shadows
   - Existing API and mock-data behavior
   - Existing component responsibilities and data ownership

Do not implement anything until I explicitly approve the plan.

API contract
------------

Use the existing API endpoints:

GET /users
GET /boards/mini-trello
PATCH /cards/:cardId

The card collection data has the following shape:

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

Before implementation, verify how the existing API expects PATCH payloads to be structured. Do not invent a different API contract.

Functional requirements
-----------------------

1. Members

Implement member assignment management for cards.

Requirements:

- When a card is not selected, display only the number of assigned members.
- When a card is selected, display the assigned users.
- Allow one or more users from GET /users to be assigned to the card.
- Allow an assigned user to be removed.
- Provide a clear remove control, such as a cross button, next to each assigned user.
- Persist assignment changes through PATCH /cards/:cardId.
- Keep member state synchronized with the board data after successful updates.
- Clearly handle loading and API errors without silently losing user changes.

Correctness criteria:

- A card with no assigned users displays an appropriate empty state.
- A card with one or more assigned users displays the correct count when collapsed.
- Selecting the card reveals the correct users.
- Adding a user updates the card and persists the change.
- Removing a user updates the card and persists the change.
- Users cannot be duplicated in the assigned-user list.

2. Comments and activity history

Implement comment and activity management for selected cards.

Requirements:

- Display comments only when the card is selected.
- Add a control to show or hide the card's comment/activity history.
- Display, at minimum:
  - Comment author
  - Comment text
  - Creation time
- Provide an input for writing a new comment.
- Provide an explicit action to publish the comment.
- Allow the author to be selected from the users returned by GET /users.
- Persist new comments through PATCH /cards/:cardId.
- Keep the comment list synchronized after a successful update.

Correctness criteria:

- The comments section is hidden for unselected cards.
- Toggling the comments control shows and hides the history without changing the card data.
- A comment cannot be published without the required content and author.
- A newly published comment displays the selected author, text, and creation time.
- Existing comments remain unchanged when a new comment is published.
- API failures are visible to the user and do not falsely appear as successful publications.

3. Checklist tasks

Implement checklist management for selected cards.

Requirements:

- Display checklist tasks only when the card is selected.
- Add a control to show or hide the checklist.
- Display each task's description and completion state.
- Provide an input and explicit action to create a new task.
- Allow a task to be checked as completed.
- Allow a completed task to be unchecked again.
- Persist task creation and completion changes through PATCH /cards/:cardId.
- Keep checklist state synchronized after successful updates.

Correctness criteria:

- The checklist is hidden for unselected cards.
- Toggling the checklist control shows and hides the tasks without changing their state.
- A new task contains a description and starts as incomplete.
- Checking a task changes its state to completed and persists the change.
- Unchecking a task changes its state back to incomplete and persists the change.
- Existing tasks remain unchanged when a new task is created.
- Empty task descriptions are rejected.
- API failures are visible to the user and do not falsely appear as successful updates.

Component responsibilities
--------------------------

Respect the existing component boundaries:

- BoardPage owns board-level data, selected-card state, focus, movement, drag-and-drop coordination, and persistence orchestration.
- Board composes the board and columns without duplicating card business logic.
- Column renders cards in order and delegates card creation, selection, editing, and drop actions.
- Card renders the card and delegates selection, editing, movement, and drag-and-drop actions. It should not become the owner of board-level data.
- EditCardDrawer manages the card-editing boundary and should remain consistent with the existing editing workflow.

Place the members, comments, and checklist UI in the component that owns the corresponding interaction, while keeping server state and mutations in the established data-owner layer.

Implementation constraints
-------------------------

- Do not restore or duplicate previously reverted code without first checking the current implementation.
- Reuse existing types, API helpers, mutation helpers, state-management patterns, styling, and localization conventions.
- Do not introduce a second source of truth for card data.
- Preserve optimistic-update behavior if it already exists, including rollback on failure.
- Preserve the existing mock-data mode where applicable.
- Do not change unrelated functionality.
- Add or update tests for the new behavior where the project's existing testing conventions support it.
- Run the relevant lint, type-check, build, and test commands after implementation.
- Report any API limitations or ambiguities instead of silently working around them.

First provide an implementation plan identifying:

1. Files and components that need to change.
2. Where the data will be owned and mutated.
3. How the PATCH payloads will be constructed.
4. How loading, errors, and rollback will work.
5. How the behavior will be tested.

Do not implement before I explicitly say to proceed.
