export type CardComment = {
  user: string
  comment: string
  createdAt: string
}

export type NewCardComment = {
  user: string
  comment: string
  // The API generates the date for a new comment.
  createdAt?: never
}

export type CardChecklistItem = {
  description: string
  done: boolean
}

export type CardCollections = {
  assignees: string[]
  comments: CardComment[]
  checklistItems: CardChecklistItem[]
}

// Each supplied list replaces the server list; omitted lists stay unchanged.
export type CardCollectionsPatch = {
  assignees?: string[]
  comments?: (CardComment | NewCardComment)[]
  checklistItems?: CardChecklistItem[]
}

export type CardData = CardCollections & {
  id: string
  title: string
  description?: string
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
