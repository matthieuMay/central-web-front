// A person returned by GET /users.
export type User = {
  id: string
  firstname: string
  lastname: string
}

// A comment on a Card. createdAt is created by the API: never send it for a new comment.
export type CardComment = {
  user: string // id of the author (a User)
  comment: string
  createdAt?: string
}

// A checklist task. The API gives no id: a task is identified by its position in the list.
export type ChecklistItem = {
  description: string
  done: boolean
}

export type CardData = {
  id: string
  title: string
  description?: string
  // Sprint 5 collections. Optional: a Card created on screen may not have them yet (treat as []).
  assignees?: string[] // ids of the assigned Users
  comments?: CardComment[]
  checklistItems?: ChecklistItem[]
}

export type ColumnData = {
  id: string
  title: string
  cards: CardData[]
}

export type BoardData = {
  id: string
  title: string
  columns: ColumnData[]
}