import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
  confettiCardId: string | null
  confettiBurst: number
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, onMoveCard, confettiCardId, confettiBurst }: BoardProps) {
  function moveCard(cardId: string, columnId: string, visualPosition: number) {
    const sourceColumn = board.columns.find((column) => column.cards.some((card) => card.id === cardId))
    const sourceIndex = sourceColumn?.cards.findIndex((card) => card.id === cardId) ?? -1
    const position = sourceColumn?.id === columnId && sourceIndex >= 0 && sourceIndex < visualPosition
      ? visualPosition - 1
      : visualPosition
    onMoveCard(cardId, columnId, position)
  }

  return (
    <DndProvider backend={HTML5Backend}>
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} onMoveCard={moveCard} confettiCardId={column.id === board.columns.at(-1)?.id ? confettiCardId : null} confettiBurst={confettiBurst} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
    </DndProvider>
  )
}
