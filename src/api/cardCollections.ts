import type { CardChecklistItem, CardCollectionsPatch, CardData, NewCardComment } from '../types/board'

export type CardCollectionsAction =
  | { type: 'set-assignee'; userId: string; assigned: boolean }
  | { type: 'add-comment'; comment: NewCardComment }
  | { type: 'add-checklist-item'; description: string }
  | { type: 'set-checklist-done'; index: number; item: CardChecklistItem; done: boolean }

export function buildCardCollectionsPatch(card: CardData, action: CardCollectionsAction): CardCollectionsPatch {
  switch (action.type) {
    case 'set-assignee': {
      if (!action.userId.trim()) throw new Error('Choisissez un utilisateur.')
      return { assignees: action.assigned
        ? [...new Set([...card.assignees, action.userId])]
        : card.assignees.filter((id) => id !== action.userId) }
    }
    case 'add-comment': {
      const comment = action.comment.comment.trim()
      if (!action.comment.user.trim() || !comment) throw new Error('Choisissez un auteur et saisissez un commentaire.')
      return { comments: [...card.comments, { user: action.comment.user, comment }] }
    }
    case 'add-checklist-item': {
      const description = action.description.trim()
      if (!description) throw new Error('Saisissez une tâche.')
      return { checklistItems: [...card.checklistItems, { description, done: false }] }
    }
    case 'set-checklist-done': {
      const current = card.checklistItems[action.index]
      if (!Number.isSafeInteger(action.index) || action.index < 0 || !current || current.description !== action.item.description || current.done !== action.item.done) {
        throw new Error('Cette tâche a changé. Réessayez depuis la liste actualisée.')
      }
      // shortcut: identical external replacements cannot be identified, use server IDs if tasks gain reordering.
      return { checklistItems: card.checklistItems.map((item, index) => index === action.index ? { ...item, done: action.done } : item) }
    }
  }
}
