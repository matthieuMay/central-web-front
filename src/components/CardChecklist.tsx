import { Box } from '@chakra-ui/react'
import type { ChecklistItem } from '../types/board'

export type CardChecklistProps = {
  items: ChecklistItem[]
  onChange?: (items: ChecklistItem[]) => void
}

export function CardChecklist(props: CardChecklistProps) {
  return <Box data-component="card-checklist" data-item-count={props.items.length} />
}
