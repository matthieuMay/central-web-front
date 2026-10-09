import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData } from '../types/board'
import type { DragCard } from './Card'
import { Column } from './Column'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  confettiCardId: string | null
  onDropCard: (item: DragCard, columnId: string, position: number) => void
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, confettiCardId, onDropCard }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} columns={board.columns} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} confettiCardId={confettiCardId} onDropCard={onDropCard} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
