import { Stack, Text } from '@chakra-ui/react'
import { useUpdateCardCollections } from '../api/mutations'
import { useUsers } from '../api/users'
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
  const users = useUsers()
  // One mutation per section, so each knows whether its own list is saving or failed.
  const members = useUpdateCardCollections()
  const comments = useUpdateCardCollections()
  const checklist = useUpdateCardCollections()
  const people = users.data ?? []

  return (
    <Stack gap={6} mt={6}>
      {users.isPending && <Text role="status" className="board-status">Loading people…</Text>}
      {users.isError && <Text role="alert" color="red.fg">Could not load people: {users.error.message}</Text>}
      <div>
        <MemberPicker users={people} assignees={card.assignees ?? []} disabled={members.isPending || !users.data}
          onChange={async (assignees) => { await members.mutateAsync({ cardId: card.id, patch: { assignees } }) }} />
        {members.isError && <Text role="alert" color="red.fg" mt={2}>Could not save members: {members.error.message}. Try again.</Text>}
      </div>
      <div>
        <CommentThread users={people} comments={card.comments ?? []} disabled={comments.isPending || !users.data}
          onPost={async (next) => { await comments.mutateAsync({ cardId: card.id, patch: { comments: next } }) }} />
        {comments.isError && <Text role="alert" color="red.fg" mt={2}>Could not post comment: {comments.error.message}. Try again.</Text>}
      </div>
      <div>
        <Checklist items={card.checklistItems ?? []} disabled={checklist.isPending}
          onChange={async (checklistItems) => { await checklist.mutateAsync({ cardId: card.id, patch: { checklistItems } }) }} />
        {checklist.isError && <Text role="alert" color="red.fg" mt={2}>Could not save checklist: {checklist.error.message}. Try again.</Text>}
      </div>
    </Stack>
  )
}
