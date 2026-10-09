export type UserData = {
  id: string
  firstname: string
  lastname: string
}

export type CardData = {
  id: string
  title: string
  description?: string
  assignees?: Array<UserData | string>
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
