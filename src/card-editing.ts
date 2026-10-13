import type { CardData, CardCollectionsPatch, ChecklistItem, CommentData, UserData } from './types/board'

export type CardEdit = {
  kind: 'add-member' | 'remove-member'
  userId: string
} | {
  kind: 'add-comment'
  userId: string
  comment: string
} | {
  kind: 'add-task'
  description: string
} | {
  kind: 'set-task-done'
  index: number
  expected: ChecklistItem
  done: boolean
} | {
  kind: 'rename-task'
  index: number
  expected: ChecklistItem
  description: string
}

export class CardEditConflict extends Error {
}

type TaskEdit = Extract<CardEdit, {
  kind: 'set-task-done' | 'rename-task'
}>

function updateChecklistItem(items: ChecklistItem[], edit: TaskEdit): ChecklistItem[] | undefined {
  const current = items[edit.index]
  const hasChanged = !current || current.description !== edit.expected.description ||
    current.done !== edit.expected.done
  if (hasChanged) {
    throw new CardEditConflict('Cette tâche a changé. Vérifiez la liste actualisée avant de la modifier.')
  }
  const updated = edit.kind === 'set-task-done'
    ? { ...current, done: edit.done }
    : { ...current, description: edit.description.trim() }
  const unchanged = updated.description === current.description && updated.done === current.done
  if (!updated.description || unchanged)
    return
  return items.map((item, index) => index === edit.index ? updated : item)
}

export function getChronologicalComments(comments: CommentData[]) {
  return comments.map((comment, index) => ({ comment, index }))
    .sort((first, second) => Date.parse(first.comment.createdAt) - Date.parse(second.comment.createdAt) ||
      first.index - second.index)
}

export function userName(users: UserData[], id: string) {
  const user = users.find(user => user.id === id)
  return user ? `${user.firstname} ${user.lastname}` : `Utilisateur indisponible (${id})`
}

export function createCardPatch(card: CardData, edit: CardEdit): CardCollectionsPatch | undefined {
  switch (edit.kind) {
    case 'add-member':
      if (!edit.userId || card.assignees.includes(edit.userId))
        return
      return { assignees: [...card.assignees, edit.userId] }
    case 'remove-member':
      if (!card.assignees.includes(edit.userId))
        return
      return { assignees: card.assignees.filter(id => id !== edit.userId) }
    case 'add-comment':
      if (!edit.userId || !edit.comment.trim())
        return
      return { comments: [...card.comments, { user: edit.userId, comment: edit.comment.trim() }] }
    case 'add-task':
      if (!edit.description.trim())
        return
      return { checklistItems: [...card.checklistItems, { description: edit.description.trim(), done: false }] }
    case 'set-task-done':
    case 'rename-task': {
      const checklistItems = updateChecklistItem(card.checklistItems, edit)
      return checklistItems ? { checklistItems } : undefined
    }
  }
}
