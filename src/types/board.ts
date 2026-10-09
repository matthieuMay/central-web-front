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

export type CommentInput = Omit<CommentData, 'createdAt'> & { createdAt?: string }

export type TaskData = {
  description: string
  done: boolean
}

export type CardData = {
  id: string
  title: string
  description?: string
  assignees?: Array<UserData | string>
  comments?: CommentData[]
  checklistItems?: TaskData[]
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
