import type { CardData } from '../types/board'

// Responsibility: a read-only summary on the board card: how many members,
// checklist progress (done/total) and how many comments.
// Props: the card. Triggers nothing; details and edits live in the drawer.
// Cases to verify:
// - renders nothing when every list is empty or missing;
// - counts follow optimistic writes and their rollback.
export function CardBadges(_props: { card: CardData }) {
  return null
}
