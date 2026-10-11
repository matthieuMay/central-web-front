import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import { useState } from 'react'
import { useMoveCard } from '../api/mutations'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }
export type MoveDirection = 'left' | 'right' | 'up' | 'down'

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const move = useMoveCard()

  function moveSelectedCard(direction: MoveDirection) {
    if (!selectedCardId || move.isPending) return

    const sourceColumnIndex = board.columns.findIndex((column) =>
      column.cards.some((card) => card.id === selectedCardId),
    )
    if (sourceColumnIndex < 0) return

    const sourceColumn = board.columns[sourceColumnIndex]
    const sourceCardIndex = sourceColumn.cards.findIndex((card) => card.id === selectedCardId)
    let destinationColumnIndex = sourceColumnIndex
    let destinationPosition = sourceCardIndex

    if (direction === 'left' || direction === 'right') {
      destinationColumnIndex += direction === 'left' ? -1 : 1
      if (destinationColumnIndex < 0 || destinationColumnIndex >= board.columns.length) return
      destinationPosition = board.columns[destinationColumnIndex].cards.length
    } else {
      destinationPosition += direction === 'up' ? -1 : 1
      if (destinationPosition < 0 || destinationPosition >= sourceColumn.cards.length) return
    }

    move.mutate({
      cardId: selectedCardId,
      columnId: board.columns[destinationColumnIndex].id,
      position: destinationPosition,
    })
  }

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      {move.isError && <p role="alert">Could not move card: {move.error.message}</p>}
      <LayoutGroup>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              onMoveCard={moveSelectedCard}
            />
          ))}
        </SimpleGrid>
      </LayoutGroup>
    </Stack>
  )
}
