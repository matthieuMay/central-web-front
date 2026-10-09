export type User = {
  id: string
  firstname: string
  lastname: string
}

export type CardComment = {
  user: string
  comment: string
  createdAt: string
}

export type CommentInput = {
  user: string
  comment: string
}

export type ChecklistItem = {
  description: string
  done: boolean
}

export type CardData = {
  id: string
  title: string
  description?: string
  assignees: string[]
  comments: CardComment[]
  checklistItems: ChecklistItem[]
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
