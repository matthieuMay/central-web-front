export type CardData = {
  id: string
  title: string
  description?: string
  assignees: string[]
  comments: CommentData[]
  checklistItems: ChecklistItemData[]
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


export type UserData = { 
    id: string; 
    firstname: string; 
    lastname: string }


export type CommentData = { 
    user: string; 
    comment: string; 
    createdAt: string }


export type ChecklistItemData = { 
    description: string; 
    done: boolean }