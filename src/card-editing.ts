import type { CardData, CardCollectionsPatch, ChecklistItem, UserData } from './types/board'

export type CardEdit =
  | { kind: 'add-member' | 'remove-member'; userId: string }
  | { kind: 'add-comment'; userId: string; comment: string }
  | { kind: 'add-task'; description: string }
  | { kind: 'set-task-done'; index: number; expected: ChecklistItem; done: boolean }
  | { kind: 'rename-task'; index: number; expected: ChecklistItem; description: string }

export class CardEditConflict extends Error {}

export function userName(users: UserData[], id: string) {
  const user = users.find(user => user.id === id)
  return user ? `${user.firstname} ${user.lastname}` : `Utilisateur indisponible (${id})`
}

export function createCardPatch(card: CardData, edit: CardEdit): CardCollectionsPatch | undefined {
  switch (edit.kind) {
    case 'add-member':
      if (!edit.userId || card.assignees.includes(edit.userId)) return
      return { assignees: [...card.assignees, edit.userId] }
    case 'remove-member':
      if (!card.assignees.includes(edit.userId)) return
      return { assignees: card.assignees.filter(id => id !== edit.userId) }
    case 'add-comment':
      if (!edit.userId || !edit.comment.trim()) return
      return { comments: [...card.comments, { user: edit.userId, comment: edit.comment.trim() }] }
    case 'add-task':
      if (!edit.description.trim()) return
      return { checklistItems: [...card.checklistItems, { description: edit.description.trim(), done: false }] }
    case 'set-task-done':
    case 'rename-task': {
      const current = card.checklistItems[edit.index]
      if (!current || current.description !== edit.expected.description || current.done !== edit.expected.done) {
        throw new CardEditConflict('Cette tâche a changé. Vérifiez la liste actualisée avant de la modifier.')
      }
      const updated = edit.kind === 'set-task-done' ? { ...current, done: edit.done }
        : { ...current, description: edit.description.trim() }
      if (!updated.description || (updated.description === current.description && updated.done === current.done)) return
      return { checklistItems: card.checklistItems.map((item, index) => index === edit.index ? updated : item) }
    }
  }
}
