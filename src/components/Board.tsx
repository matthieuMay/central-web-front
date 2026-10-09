import { useState } from 'react'
import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import type { CardDragPayload, DropPoint } from '../lib/dnd'
import { useMoveCard, useUpdateCard } from '../lib/queries'
import { Column } from './Column'
import type { CardPatch } from './Card'
import Confetti from './Confetti'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number } | null>(null)
  const moveCard = useMoveCard()
  const updateCard = useUpdateCard()

  const lastColumnId = board.columns[board.columns.length - 1]?.id

  function handleMoveCard(
    payload: CardDragPayload,
    toColumnId: string,
    toIndex: number,
    dropPoint: DropPoint,
  ) {
    const { cardId, columnId: fromColumnId } = payload

    const from = board.columns.find((column) => column.id === fromColumnId)
    const to = board.columns.find((column) => column.id === toColumnId)
    if (!from || !to) return

    const fromIndex = from.cards.findIndex((card) => card.id === cardId)
    if (fromIndex === -1) return

    let index = toIndex
    if (fromColumnId === toColumnId && fromIndex < toIndex) index -= 1
    index = Math.max(0, Math.min(index, to.cards.length))

    moveCard.mutate({ cardId, columnId: toColumnId, position: index })

    if (toColumnId === lastColumnId && fromColumnId !== lastColumnId) {
      setConfetti((previous) => ({
        id: (previous?.id ?? 0) + 1,
        x: dropPoint.x,
        y: dropPoint.y,
      }))
    }
  }

  function handleUpdateCard(_columnId: string, cardId: string, patch: CardPatch) {
    updateCard.mutate({ cardId, patch })
  }

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">
        {board.title}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onMoveCard={handleMoveCard}
            onUpdateCard={handleUpdateCard}
          />
        ))}
      </SimpleGrid>
      {confetti && <Confetti key={confetti.id} origin={{ x: confetti.x, y: confetti.y }} />}
    </Stack>
  )
}
