import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData, User } from '../types/board'
import { Column } from './Column'
import { DragPreview } from './DragPreview'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onComments: (id: string) => void
  users: User[]
  moving: boolean
  celebrationCardId: string | null
  celebrationToken: number
  onMoveCard: (cardId: string, columnId: string, position: number, sourceColumnId: string) => void
  onChecklistChange: (cardId: string, items: BoardData['columns'][number]['cards'][number]['checklistItems']) => void
  checklistDisabled: boolean
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, onComments, users, moving, celebrationCardId, celebrationToken, onMoveCard, onChecklistChange, checklistDisabled }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <DragPreview />
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} onComments={onComments} users={users} moving={moving} celebrationCardId={celebrationCardId} celebrationToken={celebrationToken} onMoveCard={onMoveCard} onChecklistChange={onChecklistChange} checklistDisabled={checklistDisabled} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
