export type CardData = {
  id: string
  title: string
  description?: string
  urgency?: Urgency
  assignees?: string[]
  comments?: CommentData[]
  checklistItems?: ChecklistItem[]
}

export const urgencyOptions = [
  { value: 'softly_urgent', label: 'Softly urgent', color: '#166534', background: '#dcfce7' },
  { value: 'moderately_urgent', label: 'Moderately urgent', color: '#854d0e', background: '#fef9c3' },
  { value: 'very_urgent', label: 'Very urgent', color: '#9a3412', background: '#ffedd5' },
  { value: 'extremely_urgent', label: 'Extremely urgent', color: '#991b1b', background: '#fee2e2' },
] as const

export type Urgency = typeof urgencyOptions[number]['value']

export type UserData = { id: string; firstname: string; lastname: string }
export type CommentData = { user: string; comment: string; createdAt: string }
export type NewComment = { user: string; comment: string }
export type ChecklistItem = { description: string; done: boolean }
export type CardCollectionsUpdate = {
  urgency?: Urgency
  assignees?: string[]
  comments?: (CommentData | NewComment)[]
  checklistItems?: ChecklistItem[]
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
