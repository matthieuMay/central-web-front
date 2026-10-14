import { Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../api/board'
import type { BoardData } from '../types/board'

// Sprint 6 — Workload of each member, shown under the sprint progress.
// Responsibility: DISPLAY ONLY, nothing is sent to the API.
// - get the members with useQuery({ queryKey: ['users'], queryFn: getUsers })
//   (same key as CardDetails, so the list is shared and not fetched twice);
// - for each member, count the Cards (all columns) whose assignees contain his id;
// - also count the Cards that have no assignee ("Unassigned");
// - show one line per member: "Firstname Lastname · N cards" (members with 0 cards included);
// - while the members are loading, show "Loading members…"; on error, show a short message.
type MemberLoadProps = {
  board: BoardData
}

export function MemberLoad({ board }: MemberLoadProps) {
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers })

  if (users.isPending) return <Text color="fg.muted">Loading members…</Text>
  if (users.isError) return <Text role="alert" color="fg.error">Could not load members: {users.error.message}</Text>

  // flatMap puts the Cards of every column in one single list.
  const cards = board.columns.flatMap((column) => column.cards)
  // assignees is optional: a Card without it has no member.
  const unassigned = cards.filter((card) => (card.assignees ?? []).length === 0).length

  return (
    <Stack as="ul" gap={1} listStyleType="none" fontSize="sm">
      {users.data.map((user) => {
        const count = cards.filter((card) => (card.assignees ?? []).includes(user.id)).length
        return <Text as="li" key={user.id}>{user.firstname} {user.lastname} · {count} cards</Text>
      })}
      <Text as="li" color="fg.muted">Unassigned · {unassigned} cards</Text>
    </Stack>
  )
}
