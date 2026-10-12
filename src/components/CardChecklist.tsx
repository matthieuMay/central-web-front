import { Box, Heading, Text } from '@chakra-ui/react'
import type { ChecklistItem } from '../types/board'

type CardChecklistProps = {
  items: ChecklistItem[]
  isSaving: boolean
  onChange: (items: ChecklistItem[]) => void // the NEW full list of tasks
}

/*
 * CardChecklist — the tasks to tick on this Card.
 *
 * Responsibility:
 *   - Shows each task with a checkbox (done / not done).
 *   - Lets the user add a task (description must not be blank, it is trimmed).
 *   - Lets the user check and uncheck a task.
 *
 * Action: calls onChange with the complete new list. Tasks have no id: a task is
 * identified by its index, and only that index changes.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Adding a task keeps the existing ones, in the same order.
 *   - Checking or unchecking one task does not change its neighbours.
 *   - No tasks yet: show "No tasks" and the add field still works.
 *   - Controls are disabled while isSaving.
 */
export function CardChecklist(props: CardChecklistProps) {
  // Temporary render
  return (
    <Box>
      <Heading as="h3" size="sm">Checklist</Heading>
      <Text fontSize="sm" color="fg.muted">{props.items.length} task(s) — to implement</Text>
    </Box>
  )
}