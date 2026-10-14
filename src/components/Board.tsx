import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData } from '../types/board'
import { Column, type DragProps } from './Column'
import { SprintProgress } from './SprintProgress'
import { MemberLoad } from './MemberLoad'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  drag: DragProps
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, drag }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SprintProgress board={board} />
      <MemberLoad board={board} />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} drag={drag} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
