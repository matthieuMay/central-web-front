import { useState } from 'react'
import { Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import type { CardDragPayload, DropPoint } from '../lib/dnd'
import { cardMatchesQuery, normalizeQuery } from '../lib/search'
import { useMoveCard, useUpdateCard, useUsers } from '../lib/queries'
import { CardDetails } from './CardDetails'
import { Column } from './Column'
import type { CardPatch } from './Card'
import Confetti from './Confetti'
import { SearchBar } from './SearchBar'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number } | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const moveCard = useMoveCard()
  const updateCard = useUpdateCard()
  const { data: users } = useUsers()

  const normalizedQuery = normalizeQuery(query)
  const matchCount = normalizedQuery
    ? board.columns.reduce(
        (total, column) =>
          total + column.cards.filter((card) => cardMatchesQuery(card, normalizedQuery)).length,
        0,
      )
    : 0

  const lastColumnId = board.columns[board.columns.length - 1]?.id
  const selectedCard = selectedCardId
    ? board.columns.flatMap((column) => column.cards).find((card) => card.id === selectedCardId)
    : undefined

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
      <Flex align={{ base: 'stretch', md: 'center' }} justify="space-between" gap={4} wrap="wrap">
        <Heading as="h1" size="2xl">
          {board.title}
        </Heading>
        <SearchBar value={query} onChange={setQuery} />
      </Flex>
      {normalizedQuery && (
        <Text color="fg.muted" fontSize="sm">
          {matchCount === 0
            ? `No cards match “${query.trim()}”.`
            : `${matchCount} card${matchCount === 1 ? '' : 's'} match “${query.trim()}”.`}
        </Text>
      )}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            query={query}
            onMoveCard={handleMoveCard}
            onUpdateCard={handleUpdateCard}
            onOpenDetails={setSelectedCardId}
          />
        ))}
      </SimpleGrid>
      {selectedCard && (
        <CardDetails
          card={selectedCard}
          users={users ?? []}
          onPatch={(patch) => updateCard.mutate({ cardId: selectedCard.id, patch })}
          onClose={() => setSelectedCardId(null)}
        />
      )}
      {confetti && <Confetti key={confetti.id} origin={{ x: confetti.x, y: confetti.y }} />}
    </Stack>
  )
}
