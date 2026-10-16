import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useMoveCard } from '../api/mutations'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const { mutate: moveCardMutation, isPending: movePending, isError, error } = useMoveCard()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (!selectedCardId || !(target instanceof HTMLElement) ||
        target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.altKey || event.ctrlKey || event.metaKey || movePending) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const direction = event.key === 'ArrowLeft' ? -1 : 1
      const sourceIndex = board.columns.findIndex((column) =>
        column.cards.some((card) => card.id === selectedCardId))
      const destination = board.columns[sourceIndex + direction]
      if (!destination) return
      event.preventDefault()
      moveCardMutation({ cardId: selectedCardId, columnId: destination.id })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board.columns, movePending, moveCardMutation, selectedCardId])

  function selectCard(cardId: string) {
    setSelectedCardId((current) => current === cardId ? null : cardId)
  }

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      {isError && <p role="alert">Could not move card: {error.message}</p>}
      {movePending && <p role="status">Moving card…</p>}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            selectedCardId={selectedCardId}
            onSelectCard={selectCard}
            onMoveCard={(cardId, direction) => {
              setSelectedCardId(cardId)
              const destination = board.columns[index + direction]
              if (destination && !movePending) moveCardMutation({ cardId, columnId: destination.id })
            }}
            canMoveLeft={index > 0}
            canMoveRight={index < board.columns.length - 1}
            movePending={movePending}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
