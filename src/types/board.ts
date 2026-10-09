export type UserData = {
  id: string
  firstname: string
  lastname: string
}

export type CommentData = {
  user: string
  comment: string
  createdAt: string
}

export type ChecklistItem = {
  description: string
  done: boolean
}

export type CardCollections = {
  assignees: string[]
  comments: CommentData[]
  checklistItems: ChecklistItem[]
}

export type CardData = {
  id: string
  title: string
  description?: string
} & CardCollections

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
