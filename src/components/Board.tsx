import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useRef } from 'react'
import { useImmer } from 'use-immer'
import { Column } from './Column'
import type { Board as BoardData, Card as CardData } from '../types/board'

type BoardProps = {
  board: BoardData
}

export type DropTarget = {
  columnId: string
  index: number
}

type ColumnRect = {
  id: string
  left: number
  right: number
  top: number
  bottom: number
}

type CardRect = {
  id: string
  columnId: string
  top: number
  bottom: number
}

export function Board({ board }: BoardProps) {
  const [columns, updateColumns] = useImmer(board.columns)
  const [dropTarget, setDropTarget] = useImmer<DropTarget | null>(null)
  const columnRectsRef = useRef<ColumnRect[]>([])
  const cardRectsRef = useRef<CardRect[]>([])

  const snapshotRects = () => {
    columnRectsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-column-id]'),
    ).map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        id: element.dataset.columnId ?? '',
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
      }
    })

    cardRectsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>('[data-card-id]'),
    ).map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        id: element.dataset.cardId ?? '',
        columnId: element.closest('[data-column-id]')?.getAttribute('data-column-id') ?? '',
        top: rect.top,
        bottom: rect.bottom,
      }
    })
  }

  const findColumnAt = (point: { x: number; y: number }) => {
    const rects = columnRectsRef.current
    if (rects.length === 0) {
      return null
    }

    // Colonne dont le rectangle contient le curseur.
    const inside = rects.find(
      (rect) =>
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom,
    )
    if (inside) {
      return inside.id
    }

    // Sinon, colonne la plus proche horizontalement (utile quand le curseur
    // est au-dessus ou en-dessous de la colonne).
    let closest: ColumnRect | null = null
    let closestDistance = Number.POSITIVE_INFINITY
    for (const rect of rects) {
      const dx =
        point.x < rect.left ? rect.left - point.x : point.x > rect.right ? point.x - rect.right : 0
      const dy =
        point.y < rect.top ? rect.top - point.y : point.y > rect.bottom ? point.y - rect.bottom : 0
      const distance = Math.hypot(dx, dy)
      if (distance < closestDistance) {
        closestDistance = distance
        closest = rect
      }
    }

    return closest?.id ?? null
  }

  const computeDropTarget = (
    point: { x: number; y: number },
    draggedCardId: string,
  ): DropTarget | null => {
    const columnId = findColumnAt(point)
    if (!columnId) {
      return null
    }

    const others = cardRectsRef.current.filter(
      (rect) => rect.columnId === columnId && rect.id !== draggedCardId,
    )

    const index = others.findIndex((rect) => point.y < (rect.top + rect.bottom) / 2)

    return { columnId, index: index === -1 ? others.length : index }
  }

  const handleDragStart = () => {
    snapshotRects()
    setDropTarget(null)
  }

  const handleDragMove = (card: CardData, point: { x: number; y: number }) => {
    setDropTarget(computeDropTarget(point, card.id))
  }

  const handleDragEnd = (
    card: CardData,
    fromColumnId: string,
    point: { x: number; y: number },
  ) => {
    const target = computeDropTarget(point, card.id)
    setDropTarget(null)

    if (!target) {
      return
    }

    updateColumns((draft) => {
      const from = draft.find((item) => item.id === fromColumnId)
      const to = draft.find((item) => item.id === target.columnId)
      if (!from || !to) {
        return
      }

      const fromIndex = from.cards.findIndex((item) => item.id === card.id)
      if (fromIndex === -1) {
        return
      }

      const [moved] = from.cards.splice(fromIndex, 1)

      const toIndex = to.cards.findIndex((item) => item.id === card.id)
      const insertAt = toIndex === -1 ? target.index : Math.min(target.index, to.cards.length)
      to.cards.splice(insertAt, 0, moved)
    })
  }

  return (
    <Stack gap={6}>
      <Heading as="h1">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} alignItems="start">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            dropTarget={dropTarget}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={(card, point) => handleDragEnd(card, column.id, point)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
