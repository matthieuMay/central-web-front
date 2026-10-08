import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import { useMoveCard } from '../api/mutations'
import { Column } from './Column'
import { useState } from 'react'

type BoardProps = { board: BoardData }
export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const move = useMoveCard()
  const selectedColumnIndex = board.columns.findIndex(column =>
    column.cards.some(card => card.id === selectedCardId)
  )

  function selectedCard(id: string) {
    if (move.isPending) return
    setSelectedCardId(current => current === id ? null : id)
  }

  function moveSelected(direction: -1 | 1) {
    if (!selectedCardId || move.isPending) return
    if (selectedColumnIndex === -1) return
    const destination = board.columns[selectedColumnIndex + direction]
    if (!destination) return
    const cardId = selectedCardId
    move.mutate({ cardId, columnId: destination.id }, {
      onSuccess: () => {
        requestAnimationFrame(() => document.getElementById(`card-${cardId}`)?.focus())
      },
    })
  }
  return (
    <Stack
      gap={6}
      onKeyDown={(event) => {
        const target = event.target
        if (
          target instanceof HTMLElement &&
          target.closest('input, textarea, select, [contenteditable]')
        ) return
        if (!selectedCardId) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          moveSelected(-1)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          moveSelected(1)
        }
      }}
    >
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <div>
        <button type="button" disabled={move.isPending || selectedColumnIndex <= 0} onClick={() => moveSelected(-1)}>
          Déplacer à gauche
        </button>
        <button type="button" disabled={move.isPending || selectedColumnIndex === -1 || selectedColumnIndex >= board.columns.length - 1} onClick={() => moveSelected(1)}>
          Déplacer à droite
        </button>
      </div>
      {move.isPending && <p role="status">Déplacement en cours…</p>}
      {move.isError && <p role="alert">Déplacement impossible : {move.error.message}</p>}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectedCard={selectedCard} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
