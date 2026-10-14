import { Text } from '@chakra-ui/react'
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
  // TODO Sprint 6: replace this temporary line with the list of members.
  return <Text color="fg.muted">Member load: {board.columns.length} columns — to implement</Text>
}