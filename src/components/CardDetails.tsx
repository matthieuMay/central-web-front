import { Stack, Text } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardKey, getUsers, patchCardList, type CardListChange } from '../api/board'
import type { CardComment, CardData, ChecklistItem } from '../types/board'
import { CardChecklist } from './CardChecklist'
import { CardComments, type NewComment } from './CardComments'
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
 *   - Answers each child's onChange/onAdd with a Promise<boolean>: true once the
 *     PATCH succeeded and the Board is refreshed, false if the API refused it.
 *     The child clears its input only on true, so a refused change keeps what the user typed.
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
  const queryClient = useQueryClient()
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const save = useMutation({
    // Same queue as moves and title edits: only one Board write at a time.
    scope: { id: 'board-writes' },
    mutationFn: patchCardList,
    // Returning the refresh keeps isPending true until the new lists are on screen,
    // so the next change is built from the saved lists, not the old ones.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKey, exact: true }),
  })

  async function saveList(change: CardListChange) {
    try {
      await save.mutateAsync({ cardId: props.card.id, change })
      return true
    } catch {
      return false
    }
  }

  const assignees = props.card.assignees ?? []
  const checklistItems = props.card.checklistItems ?? []
  const comments = props.card.comments ?? []

  function addComment(newComment: NewComment) {
    // Existing comments keep their createdAt; the new one has none, the API creates it.
    const next: CardComment[] = [...comments, { user: newComment.user, comment: newComment.comment }]
    return saveList({ comments: next })
  }

  let failedPart = 'change'
  if (save.variables) {
    if ('assignees' in save.variables.change) failedPart = 'members'
    else if ('checklistItems' in save.variables.change) failedPart = 'checklist'
    else failedPart = 'comment'
  }

  const errorColor = { base: 'red.700', _dark: 'red.300' }

  return (
    <Stack gap={6}>
      {users.isError && <Text role="alert" color={errorColor}>Could not load people: {users.error.message}. Members and comment authors are unavailable.</Text>}
      {save.isError && <Text role="alert" color={errorColor}>Could not save {failedPart}: {save.error.message}. Try again.</Text>}
      <CardMembers assigneeIds={assignees} users={users.data ?? []} isSaving={save.isPending} onChange={(ids: string[]) => saveList({ assignees: ids })} />
      <CardChecklist items={checklistItems} isSaving={save.isPending} onChange={(items: ChecklistItem[]) => saveList({ checklistItems: items })} />
      <CardComments comments={comments} users={users.data ?? []} isSaving={save.isPending} onAdd={addComment} />
    </Stack>
  )
}
