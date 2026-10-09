Type: grilling
Status: resolved
Blocked by:

## Question

What is the canonical domain and API contract for an ordered list of subtasks replacing `checklistItems`, including identifiers, title text, completion state, ordering, creation, update, deletion, and drag-and-drop persistence?

## Answer

Use a first-class ordered `SubtaskData` item:

```ts
type SubtaskData = {
  id: string
  title: string
  done: boolean
}
```

Cards expose `subtasks: SubtaskData[]` instead of `checklistItems`. The frontend generates a stable unique id for each new subtask, trims and rejects empty titles, appends new subtasks with `done: false`, and persists creation, completion changes, deletion, and reordering by sending the complete updated `subtasks` array through the existing `PATCH /cards/:cardId` card-collection update flow. After a successful mutation, the API response is the source of truth.
