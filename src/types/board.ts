export type MemberData = {
  id: string
  firstName: string
  lastName: string
  // A Chakra colour palette name, e.g. 'blue'
  color: string
}

export type CommentData = {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export type SubtaskData = {
  id: string
  title: string
  description?: string
  done: boolean
  assigneeIds: string[]
}

export type CardCollections = {
  assignees: string[]
  comments: CommentData[]
  subtasks: SubtaskData[]
}

export type CardData = {
  id: string
  title: string
  description?: string
} & Partial<CardCollections>

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
