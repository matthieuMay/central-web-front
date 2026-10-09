# Implementation prompt

You are working in the React/TypeScript Mini-Trello frontend repository. Implement the following product change end to end. Do not make unrelated changes. First inspect the existing components, API helpers, React Query mutations, Chakra UI theme setup, drag-and-drop behavior, and current tests. Preserve established patterns and improve the existing implementation rather than creating parallel behavior.

## Product goal

Turn each board card into a main task with ordered subtasks, add an in-memory page session with automatic comment authorship, repair the affected component controls so buttons are genuinely clickable, and add a restrained accessible color palette that works in light and dark modes.

## 1. Domain model and API contract

Replace `checklistItems` with `subtasks` throughout the frontend card model, validation, mutation payloads, rendering, and automatic completion logic.

Use this shape:

```ts
type SubtaskData = {
  id: string
  title: string
  done: boolean
}
```

`CardData` must expose `subtasks: SubtaskData[]`. The array order is the subtask order. New ids are generated on the frontend and must be stable and unique. New subtasks start with `done: false`.

Create one typed card-collection update path that sends the complete updated `subtasks` array through the existing `PATCH /cards/:cardId` convention, together with the other card collections required by the current API. After a successful mutation, use the API response as the source of truth. Never silently swallow a failed write: preserve the user's draft or previous order and show an explicit retryable error.

If the current backend still returns or expects `checklistItems`, isolate any compatibility handling in the API boundary only and make the intended new `subtasks` contract explicit. Do not scatter compatibility checks through UI components.

## 2. Subtask UI and behavior

Keep `Task` as the card integration boundary, but extract the subtask list/editor into a focused component when that improves clarity. The existing main-card drag behavior must remain unchanged.

### Creation

- Render `+ New task` below the main task title when there are no subtasks.
- Render it below the last subtask when subtasks exist.
- Clicking it inserts an inline editable row and focuses its title input immediately.
- Pressing Enter saves the new subtask.
- Pressing Escape cancels the draft without creating anything.
- Trim titles and reject blank titles.
- Keep the draft visible when persistence fails and expose an explicit retryable error.
- Ensure the control is a real button with `type="button"` and does not select or drag the main card.

### Completion

- Each subtask has a checkbox that toggles `done`.
- Persist the complete ordered subtask array.
- Keep the existing automatic card movement rule: move the main task to the completion column only when there is at least one subtask and every subtask is complete.
- An empty subtask list is not considered complete.
- Prevent duplicate move requests and preserve clear loading/error status.

### Reordering

- Only the dedicated double-arrow up/down handle at the left of the subtask title starts a drag.
- Dragging the title, checkbox, menu, or other row area must not start a subtask reorder.
- Give the handle an accessible name such as `Reorder subtask`.
- Show a visible drag state.
- Update the UI optimistically, persist the complete ordered array, and restore the previous order if the API request fails.
- Keep main-card drag-and-drop behavior intact and independently test both interaction scopes.
- Prefer the repository's existing drag-and-drop library/patterns instead of introducing another one.

### Deletion

- Render a three-dot button on the right of each subtask title.
- The button opens an accessible per-subtask menu containing `Delete`.
- The menu must be keyboard reachable, close on Escape, and close on outside click.
- Delete must always ask for confirmation before removing the item.
- On confirmation, persist the remaining ordered array.
- If deletion fails, keep the item available and show an explicit retryable error.
- Menu, confirmation, checkbox, and handle events must stop propagation where necessary so they do not select or drag the main card.

## 3. User session and comments

Create a small shared session context or hook consumed by the header/session panel and the comment form. Keep the selected identity in memory only; do not persist it in local storage.

### Initial selection

- On every page load, fetch the users from `/users`.
- Show a session chooser with every available user and an explicit `Continue anonymously` option.
- Block the board until the visitor selects a named user or anonymous mode.
- Handle loading and API errors explicitly.
- Normalize API user records through one shared display-name helper that supports the actual API response fields, including the repository's current `name` shape and any documented aliases found during inspection. Do not duplicate fallback logic in multiple components.

### Switching

- Show an always-visible session panel in the top-right corner.
- Display the current resolved user name or the anonymous state.
- Allow switching to another user or anonymous mode without reloading.
- Existing comments must remain unchanged when the current session changes.

### Comment authorship

- Remove the comment author input completely.
- Named sessions automatically use the selected user's resolved display name for new comments.
- Anonymous visitors can read existing comments but cannot submit new comments.
- Explain visibly why comment creation is disabled in anonymous mode.
- Do not allow an anonymous submission through keyboard or programmatic form interaction.
- Preserve the current comment draft when a named-user write fails, and display the API error with a retry path.

## 4. Buttons, event isolation, and accessibility

Review all three recently added/changed components and all integration points, not only the currently tagged file. Make every visible button functional.

- Use explicit `type="button"` for non-submit buttons.
- Use submit semantics only for actual form submission.
- Stop propagation for controls that must not select or drag the parent card.
- Ensure every button, checkbox, input, menu, handle, and dialog has an accessible name/label.
- Keep controls keyboard reachable and provide visible focus states.
- Disable controls only while the relevant mutation is pending; do not make unrelated controls unusable.
- Show clear loading and error states for user loading, session changes, subtask writes, comment writes, member writes, card moves, deletion, and retry actions.
- Avoid broad catches, silent fallbacks, or success-shaped UI after failed writes.
- Preserve existing member assignment, card editing, selection, and navigation behavior.

## 5. Global colors and theme

Add a restrained, accessible palette while preserving the existing light/dark toggle:

- A clear accent for primary actions such as `+ New task`, session confirmation, and comment submission.
- Subtle but distinguishable card/column surfaces.
- Semantic success styling for completed subtasks and successful states.
- Semantic warning/error styling for validation and failed writes.
- Sufficient contrast in both light and dark modes.
- Reuse Chakra theme tokens or the repository's established styling mechanism; do not hard-code a second unrelated theme system.
- Do not perform a full visual redesign.

## 6. Tests and validation

Add or update focused tests using the repository's existing test framework and conventions. At minimum cover:

1. `/users` loading, error handling, display-name normalization, initial named-user selection, and anonymous selection.
2. Board gating until a session choice is made and top-right session switching.
3. Anonymous read access and blocked comment submission.
4. Automatic comment authorship and removal of the author input.
5. Subtask creation placement, immediate focus, Enter save, Escape cancel, blank validation, and failed-write draft retention.
6. Subtask completion persistence and automatic card movement only for a non-empty all-complete list.
7. Handle-only subtask drag, optimistic reorder, API rollback, and preservation of main-card drag behavior.
8. Overflow menu keyboard behavior, outside/Escape close, confirmation, deletion persistence, and failed-delete recovery.
9. Button event isolation from card selection and drag.
10. Accessible labels/focus states and light/dark palette rendering.
11. Existing member assignment and card editing regressions.

Run the smallest relevant test selection first, then the repository's normal type-check/build and test commands. Report any pre-existing failures separately from regressions introduced by this work.

## Completion criteria

The implementation is complete only when the frontend uses `subtasks` consistently, session authorship is automatic and secure against anonymous posting, all specified controls work with explicit feedback, main-card drag behavior remains intact, the light/dark UI has the agreed accessible palette, focused tests pass, and type-check/build validation succeeds.
