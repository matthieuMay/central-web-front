import { Box } from '@chakra-ui/react'
import type { User } from '../types/board'

export type CardAssigneesProps = {
  assigneeIds: string[]
  users: User[]
  onChange?: (assigneeIds: string[]) => void
}

export function CardAssignees(props: CardAssigneesProps) {
  return <Box data-component="card-assignees" data-assignee-count={props.assigneeIds.length} data-user-count={props.users.length} />
}
