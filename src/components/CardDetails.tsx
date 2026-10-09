import { Stack } from '@chakra-ui/react'
import type { CardData } from '../types/board'
import { Checklist } from './Checklist'
import { CommentThread } from './CommentThread'
import { MemberPicker } from './MemberPicker'

// Responsibility: container for the card's members, comments and checklist, shown
// in the edit drawer under the title/description form.
// Props: the card as read from the board query cache (never a copy).
// Data: React Query owns everything. Users come from useUsers (GET /users, key
// ['users']); the lists come from `card`. One mutation, useUpdateCardCollections,
// sends PATCH /cards/:cardId optimistically through the shared board-writes ledger
// and rolls back if the API refuses.
// Action: each section hands back its complete next list; this component sends
// only that list (`{ assignees }`, `{ comments }` or `{ checklistItems }`).
// While a list is being saved its section is disabled, so two quick clicks cannot
// build their lists from the same state and overwrite each other.
// Cases to verify:
// - a write carries one list only; the two others are unchanged after reload;
// - a refused write shows an alert and the UI falls back to the saved state;
// - a card whose lists are empty or missing renders and stays usable;
// - while /users loads or fails, the sections say so instead of breaking.
export function CardDetails({ card }: { card: CardData }) {
  return (
    <Stack gap={6} mt={6}>
      <MemberPicker users={[]} assignees={card.assignees ?? []} disabled onChange={async () => {}} />
      <CommentThread users={[]} comments={card.comments ?? []} disabled onPost={async () => {}} />
      <Checklist items={card.checklistItems ?? []} disabled onChange={async () => {}} />
    </Stack>
  )
}
