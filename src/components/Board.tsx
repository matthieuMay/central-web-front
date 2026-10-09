import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { MoveCardInput } from '../api/placement'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import { CardDragPreview, type CardLanding, type DragPosition } from './CardDragPreview'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  disabled: boolean
  onMoveCard: (input: MoveCardInput, origin?: DragPosition) => boolean
  landing: CardLanding | null
  arrivingCardId: string | null
  onArrival: (id: string) => boolean
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, disabled, onMoveCard, arrivingCardId, onArrival, landing }: BoardProps) {
  return (
    <DndProvider backend={HTML5Backend}>
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} disabled={disabled} onMoveCard={onMoveCard} arrivingCardId={arrivingCardId} onArrival={onArrival} landing={landing} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
    <CardDragPreview board={board} />
    </DndProvider>
  )
}
