import type { CardData } from '../types/board'

/** Normalize a raw search query so matching is case- and whitespace-insensitive. */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

/** Whether a card matches an already-normalized query. An empty query matches every card. */
export function cardMatchesQuery(card: CardData, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true
  return (
    card.title.toLowerCase().includes(normalizedQuery) ||
    (card.description?.toLowerCase().includes(normalizedQuery) ?? false)
  )
}
