import { MessageSquare, SquareCheck, Users } from 'lucide-react'
import type { CardData } from '../types/board'

// Responsibility: a read-only summary on the board card: how many members,
// checklist progress (done/total) and how many comments.
// Props: the card. Triggers nothing; details and edits live in the drawer.
// Cases to verify:
// - renders nothing when every list is empty or missing;
// - counts follow optimistic writes and their rollback.
export function CardBadges({ card }: { card: CardData }) {
  const members = card.assignees?.length ?? 0
  const items = card.checklistItems ?? []
  const done = items.filter((item) => item.done).length
  const comments = card.comments?.length ?? 0
  if (!members && !items.length && !comments) return null
  return (
    <ul className="card-badges">
      {members > 0 && <li title="Members"><Users aria-hidden />{members}<span className="sr-only"> members</span></li>}
      {items.length > 0 && <li title="Checklist" data-complete={done === items.length || undefined}><SquareCheck aria-hidden />{done}/{items.length}<span className="sr-only"> tasks done</span></li>}
      {comments > 0 && <li title="Comments"><MessageSquare aria-hidden />{comments}<span className="sr-only"> comments</span></li>}
    </ul>
  )
}
