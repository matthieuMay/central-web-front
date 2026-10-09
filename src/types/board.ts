// A person from GET /users. Ids are what cards store in `assignees` and `comments[].user`.
export type User = {
  id: string
  firstname: string
  lastname: string
}

export type Comment = {
  user: string
  comment: string
  createdAt: string
}

// The API dates a new comment itself, so it is sent without `createdAt`;
// existing comments are sent back with their original date.
export type NewComment = Omit<Comment, 'createdAt'> & { createdAt?: string }

// Checklist items have no id: they are identified by their index in the list.
export type ChecklistItem = {
  description: string
  done: boolean
}

// PATCH /cards/:cardId replaces every list it receives and leaves the others alone,
// so a write only ever carries the one list it changes, complete.
export type CardCollectionsPatch = Partial<{
  assignees: string[]
  comments: NewComment[]
  checklistItems: ChecklistItem[]
}>

export type CardData = {
  id: string
  title: string
  description?: string
  // Optional because a card created optimistically has no lists until the refetch.
  assignees?: string[]
  comments?: Comment[]
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
