export type CommentData = {
  user: string
  comment: string
  createdAt: string
}

export type CommentInput = Omit<CommentData, 'createdAt'> & { createdAt?: string }

export type SubtaskData = {
  id: string
  title: string
  done: boolean
}

export type CardData = {
  id: string
  title: string
  description?: string
  assignees: string[]
  comments: CommentInput[]
  subtasks: SubtaskData[]
}

export type UserData = {
  id: string
  name?: string
  displayName?: string
  username?: string
  firstName?: string
  lastName?: string
  photo?: string
  photoUrl?: string
  avatar?: string
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
