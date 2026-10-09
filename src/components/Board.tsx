import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { BoardData } from '../types/board'
import type { DropPoint } from './cardDrag'
import { Column } from './Column'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  dragDisabled: boolean
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onDropCard: (cardId: string, columnId: string, slot: number, point: DropPoint) => void
}

export function Board({ board, selectedCardId, dragDisabled, onSelectCard, onEditCard, onDropCard }: BoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} dragDisabled={dragDisabled} onSelectCard={onSelectCard} onEditCard={onEditCard} onDropCard={onDropCard} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
    </DndProvider>
  )
}
