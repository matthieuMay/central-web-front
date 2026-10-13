export type CardData = {
  id: string
  title: string
  description?: string
  assignees: string[]
  comments: { user: string; comment: string; createdAt: string }[]
  checklistItems: { description: string; done: boolean }[]
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
