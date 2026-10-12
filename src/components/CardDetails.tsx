import { Stack } from '@chakra-ui/react'
import type { CardData, User } from '../types/board'
import { CardChecklist } from './CardChecklist'
import { CardComments } from './CardComments'
import { CardMembers } from './CardMembers'

type CardDetailsProps = {
  card: CardData
}

/*
 * CardDetails — the three Sprint 5 sections of one Card, shown in the edit drawer.
 *
 * Responsibility:
 *   - Loads the list of Users once (GET /users) and passes it to CardMembers and CardComments.
 *   - Owns the save action: receives the new full list from a child and sends
 *     PATCH /cards/:cardId with ONLY that list (assignees, comments or checklistItems).
 *   - After a successful PATCH, refreshes the Board (['board', 'mini-trello']).
 *
 * Who holds the data: the Board from the API (TanStack Query). The children only
 * display what they receive and report the user's intention.
 *
 * Cases to check:
 *   - A Card whose lists are missing or empty: treat them as [] and everything stays usable.
 *   - While a save is pending, the children are disabled (isSaving).
 *   - If the API refuses (400, network error), show an error and keep the old values on screen.
 */
export function CardDetails(props: CardDetailsProps) {
  // Temporary render: users and the save action will be added by the implementation.
  const users: User[] = [] // to load with GET /users
  return (
    <Stack gap={6} px={6} pb={6}>
      <CardMembers assigneeIds={props.card.assignees ?? []} users={users} isSaving={false} onChange={() => {}} />
      <CardChecklist items={props.card.checklistItems ?? []} isSaving={false} onChange={() => {}} />
      <CardComments comments={props.card.comments ?? []} users={users} isSaving={false} onAdd={() => {}} />
    </Stack>
  )
}