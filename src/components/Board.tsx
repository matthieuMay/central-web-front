import { useState } from 'react'
import { useImmer } from 'use-immer'
import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import type { CardDragPayload, DropPoint } from '../lib/dnd'
import { Column } from './Column'
import type { CardPatch } from './Card'
import Confetti from './Confetti'

type BoardProps = { board: BoardData }

export function Board({ board: initialBoard }: BoardProps) {
  const [board, updateBoard] = useImmer(initialBoard)
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number } | null>(null)

  const lastColumnId = board.columns[board.columns.length - 1]?.id

  function moveCard(
    payload: CardDragPayload,
    toColumnId: string,
    toIndex: number,
    dropPoint: DropPoint,
  ) {
    const { cardId, columnId: fromColumnId } = payload

    updateBoard((draft) => {
      const from = draft.columns.find((column) => column.id === fromColumnId)
      const to = draft.columns.find((column) => column.id === toColumnId)
      if (!from || !to) return

      const fromIndex = from.cards.findIndex((card) => card.id === cardId)
      if (fromIndex === -1) return

      const [card] = from.cards.splice(fromIndex, 1)

      let index = toIndex
      if (fromColumnId === toColumnId && fromIndex < toIndex) index -= 1
      index = Math.max(0, Math.min(index, to.cards.length))
      to.cards.splice(index, 0, card)
    })

    if (toColumnId === lastColumnId && fromColumnId !== lastColumnId) {
      setConfetti((previous) => ({
        id: (previous?.id ?? 0) + 1,
        x: dropPoint.x,
        y: dropPoint.y,
      }))
    }
  }

  function updateCard(columnId: string, cardId: string, patch: CardPatch) {
    updateBoard((draft) => {
      const column = draft.columns.find((item) => item.id === columnId)
      const card = column?.cards.find((item) => item.id === cardId)
      if (!card) return

      if (patch.title !== undefined) card.title = patch.title
      if (patch.description !== undefined) card.description = patch.description
    })
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
            onMoveCard={moveCard}
            onUpdateCard={updateCard}
          />
        ))}
      </SimpleGrid>
      {confetti && <Confetti key={confetti.id} origin={{ x: confetti.x, y: confetti.y }} />}
    </Stack>
  )
}
