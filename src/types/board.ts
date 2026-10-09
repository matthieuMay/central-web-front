export type CommentData = {
  user: string
  comment: string
  createdAt: string
}

/** A comment as sent to the API: omit `createdAt` for a new comment. */
export type CommentInput = {
  user: string
  comment: string
  createdAt?: string
}

export type ChecklistItemData = {
  description: string
  done: boolean
}

export type CardData = {
  id: string
  title: string
  description?: string
  assignees: string[]
  comments: CommentData[]
  checklistItems: ChecklistItemData[]
}

/** Body accepted by `PATCH /cards/:cardId`; each sent list replaces the stored one. */
export type CardPatch = {
  title?: string
  description?: string | null
  assignees?: string[]
  comments?: CommentInput[]
  checklistItems?: ChecklistItemData[]
}

export type CardCollectionsPatch = Pick<CardPatch, 'assignees' | 'comments' | 'checklistItems'>

export type UserData = {
  id: string
  firstname: string
  lastname: string
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
