import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Fragment } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  draggedCardId: string | null
  dropPosition: number | null
  onCardFocus: (cardId: string) => void
  onCardKeyDown: (cardId: string, event: KeyboardEvent<HTMLElement>) => void
  onCardDragStart: (cardId: string, event: DragEvent<HTMLElement>) => void
  onCardDragEnd: (event: DragEvent<HTMLElement>) => void
  onCardDragOver: (columnId: string, cardId: string, event: DragEvent<HTMLElement>) => void
  onCardDrop: (columnId: string, cardId: string, event: DragEvent<HTMLElement>) => void
  onColumnDragOver: (columnId: string, event: DragEvent<HTMLElement>) => void
  onColumnDrop: (columnId: string, event: DragEvent<HTMLElement>) => void
}

export function Column({
  column,
  draggedCardId,
  dropPosition,
  onCardFocus,
  onCardKeyDown,
  onCardDragStart,
  onCardDragEnd,
  onCardDragOver,
  onCardDrop,
  onColumnDragOver,
  onColumnDrop,
}: ColumnProps) {
  const remainingCards = column.cards.filter((card) => card.id !== draggedCardId)

  return (
    <Box
      as="section"
      aria-label={column.title}
      bg="var(--surface-column)"
      borderRadius="lg"
      p={4}
      minW={0}
      minH={{ base: '12rem', xl: 'calc(100dvh - 12rem)' }}
      onDragOver={(event) => onColumnDragOver(column.id, event)}
      onDrop={(event) => onColumnDrop(column.id, event)}
    >
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="var(--text-muted)">No cards yet</Text>}
        {column.cards.map((card) => {
          const insertionPosition = remainingCards.findIndex((remaining) => remaining.id === card.id)
          const dropBefore = card.id !== draggedCardId && insertionPosition === dropPosition

          return (
            <Fragment key={card.id}>
              <Card
                card={card}
                dropBefore={dropBefore}
                onFocus={() => onCardFocus(card.id)}
                onKeyDown={(event) => onCardKeyDown(card.id, event)}
                onDragStart={(event) => onCardDragStart(card.id, event)}
                onDragEnd={onCardDragEnd}
                onDragOver={(event) => onCardDragOver(column.id, card.id, event)}
                onDrop={(event) => onCardDrop(column.id, card.id, event)}
              />
            </Fragment>
          )
        })}
        {draggedCardId && dropPosition === remainingCards.length && (
          <Box aria-hidden="true" className="board-drop-indicator" />
        )}
      </Stack>
    </Box>
  )
}
