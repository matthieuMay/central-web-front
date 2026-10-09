import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import { DragPreview } from './DragPreview'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  moving: boolean
  celebrationCardId: string | null
  celebrationToken: number
  onMoveCard: (cardId: string, columnId: string, position: number, sourceColumnId: string) => void
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, moving, celebrationCardId, celebrationToken, onMoveCard }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <DragPreview />
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} moving={moving} celebrationCardId={celebrationCardId} celebrationToken={celebrationToken} onMoveCard={onMoveCard} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
