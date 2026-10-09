import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onDropCard: (cardId: string, columnId: string, index: number) => void
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, onDropCard }: BoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="4xl" className="board-title shimmer-text">{board.title}</Heading>
      <SimpleGrid className="board-columns" columns={{ base: 1, md: 2, xl: 4 }} gap={5} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} onDropCard={onDropCard} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
    </DndProvider>
  )
}
