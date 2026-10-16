import { useState } from 'react'
import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import type { CardDragPayload, DropPoint } from '../lib/dnd'
import { getCardDragData } from '../lib/dnd'
import { cardMatchesQuery, normalizeQuery } from '../lib/search'
import { Card, type CardPatch } from './Card'

type ColumnProps = {
  column: ColumnData
  query: string
  onMoveCard: (payload: CardDragPayload, toColumnId: string, toIndex: number, dropPoint: DropPoint) => void
  onUpdateCard: (columnId: string, cardId: string, patch: CardPatch) => void
  onOpenDetails: (cardId: string) => void
}

export function Column({ column, query, onMoveCard, onUpdateCard, onOpenDetails }: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const normalizedQuery = normalizeQuery(query)
  const visibleCards = normalizedQuery
    ? column.cards.filter((card) => cardMatchesQuery(card, normalizedQuery))
    : column.cards

  return (
    <Box
      as="section"
      aria-label={column.title}
      bg="bg.muted"
      borderRadius="lg"
      p={4}
      minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      outlineStyle="solid"
      outlineColor="blue.focusRing"
      outlineWidth={isDragOver ? '2px' : undefined}
      transition="outline-color 120ms"
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragOver(false)
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragOver(false)
        const payload = getCardDragData(event)
        if (payload) {
          onMoveCard(payload, column.id, column.cards.length, {
            x: event.clientX,
            y: event.clientY,
          })
        }
      }}
    >
      <Heading as="h2" size="md" mb={4}>
        {column.title}
      </Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.length > 0 && visibleCards.length === 0 && (
          <Text color="fg.muted">No matching cards</Text>
        )}
        {visibleCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columnId={column.id}
            index={column.cards.indexOf(card)}
            onMoveCard={onMoveCard}
            onUpdateCard={onUpdateCard}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </Stack>
    </Box>
  )
}
