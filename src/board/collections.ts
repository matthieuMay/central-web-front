import type { BoardData, CardComment, CardData, ChecklistItem, CommentInput } from '../types/board'

/**
 * Pure helpers for a Card's collections.
 *
 * The API replaces each collection wholesale, so every helper returns the full
 * next array. Checklist Items have no id, and only add + toggle are in scope,
 * so an item is addressed by its array index; if delete or reorder is ever
 * added, this is the seam that must switch to client-generated ids.
 */
export function addChecklistItem(items: ChecklistItem[], description: string): ChecklistItem[] {
  const trimmed = description.trim()
  if (!trimmed) return items
  return [...items, { description: trimmed, done: false }]
}

export function toggleChecklistItem(items: ChecklistItem[], index: number): ChecklistItem[] {
  if (index < 0 || index >= items.length) return items
  return items.map((item, position) => (position === index ? { ...item, done: !item.done } : item))
}

export function appendComment(comments: CardComment[], input: CommentInput): (CardComment | CommentInput)[] {
  return [...comments, input]
}

export function replaceCard(board: BoardData, card: CardData): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) =>
      column.cards.some((entry) => entry.id === card.id)
        ? { ...column, cards: column.cards.map((entry) => (entry.id === card.id ? card : entry)) }
        : column,
    ),
  }
}
