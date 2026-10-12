import { Box, Heading, Text } from '@chakra-ui/react'
import type { User } from '../types/board'

type CardMembersProps = {
  assigneeIds: string[] // ids of the Users assigned to the Card
  users: User[] // every User from GET /users
  isSaving: boolean
  onChange: (assigneeIds: string[]) => void // the NEW full list of assignee ids
}

/*
 * CardMembers — who works on this Card.
 *
 * Responsibility:
 *   - Shows the assigned members by name (firstname lastname), found in `users`.
 *   - Lets the user add a member chosen among the Users NOT yet assigned.
 *   - Lets the user remove one member.
 *
 * Action: calls onChange with the complete new list (existing ids + added one,
 * or existing ids minus removed one). It does not call the API itself.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Adding a member keeps the others; removing one keeps the others.
 *   - A User already assigned cannot be added twice (the API requires unique ids).
 *   - No members yet: show "No members" and the add control still works.
 *   - Controls are disabled while isSaving.
 */
export function CardMembers(props: CardMembersProps) {
  // Temporary render
  return (
    <Box>
      <Heading as="h3" size="sm">Members</Heading>
      <Text fontSize="sm" color="fg.muted">{props.assigneeIds.length} member(s) — to implement</Text>
    </Box>
  )
}