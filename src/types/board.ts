export type CommentData = {
  user: string
  comment: string
  createdAt: string
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

export type CardPatch = Partial<Omit<CardData, 'id'>>

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
