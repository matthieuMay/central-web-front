import type { BoardData, CardCollectionsPatch, ChecklistItem, Comment, NewComment } from '../types/board'

// Each helper returns the complete next list, since PATCH replaces whole lists.

export function toggleAssignee(assignees: string[], userId: string): string[] {
  return assignees.includes(userId) ? assignees.filter((id) => id !== userId) : [...assignees, userId]
}

export function toggleChecklistItem(items: ChecklistItem[], index: number): ChecklistItem[] {
  return items.map((item, i) => i === index ? { ...item, done: !item.done } : item)
}

export function addChecklistItem(items: ChecklistItem[], description: string): ChecklistItem[] {
  return [...items, { description: description.trim(), done: false }]
}

// Existing comments keep their date; the new one has none so the API dates it.
export function appendComment(comments: Comment[], user: string, comment: string): NewComment[] {
  return [...comments, { user, comment: comment.trim() }]
}

// Optimistic view of a PATCH. Comments are left to the refetch: a new comment has
// no date until the API gives it one.
export function applyCollectionsPatch(board: BoardData, cardId: string, { assignees, checklistItems }: CardCollectionsPatch): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => card.id === cardId
        ? { ...card, ...(assignees ? { assignees } : {}), ...(checklistItems ? { checklistItems } : {}) }
        : card),
    })),
  }
}
