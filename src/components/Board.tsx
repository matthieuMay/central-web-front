import { SimpleGrid } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { MoveCardInput } from '../api/placement'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import type { CardLanding, DragPosition } from './CardDragPreview'

type BoardProps = {
  board: BoardData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  disabled: boolean
  onMoveCard: (input: MoveCardInput, origin?: DragPosition) => boolean
  onCancelDrag: (id: string, origin: DragPosition) => void
  landing: CardLanding | null
  arrivingCardId: string | null
  onArrival: (id: string) => boolean
}

export function Board({ board, selectedCardId, onSelectCard, onEditCard, disabled, onMoveCard, onCancelDrag, arrivingCardId, onArrival, landing }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={{ base: 4, lg: 5 }} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} disabled={disabled} onMoveCard={onMoveCard} onCancelDrag={onCancelDrag} arrivingCardId={arrivingCardId} onArrival={onArrival} landing={landing} />
        ))}
      </SimpleGrid>
    </LayoutGroup>
  )
}
