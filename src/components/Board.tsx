import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useMoveCard } from '../api/mutations'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const move = useMoveCard()

  function selectCard(cardId: string) {
    setSelectedCardId(current => current === cardId ? null : cardId)
  }

  const getSelectedLocation = useCallback((cardId: string) => {
    const columnIndex = board.columns.findIndex(column => column.cards.some(card => card.id === cardId))
    return columnIndex === -1 ? null : { columnIndex }
  }, [board.columns])

  const moveSelectedCard = useCallback((direction: -1 | 1) => {
    if (!selectedCardId || move.isPending) return false

    const location = getSelectedLocation(selectedCardId)
    if (!location) return false

    const nextColumn = board.columns[location.columnIndex + direction]
    if (!nextColumn) return false

    move.mutate({ cardId: selectedCardId, columnId: nextColumn.id })
    return true
  }, [board.columns, getSelectedLocation, move, selectedCardId])

  const selectedLocation = selectedCardId ? getSelectedLocation(selectedCardId) : null
  const canMoveLeft = selectedLocation !== null && selectedLocation.columnIndex > 0
  const canMoveRight = selectedLocation !== null && selectedLocation.columnIndex < board.columns.length - 1

  useEffect(() => {
    if (!selectedCardId) return

    const card = document.getElementById(`card-${selectedCardId}`)
    if (card) card.focus({ preventScroll: true })
  }, [board.columns, selectedCardId])

  useEffect(() => {
    if (!selectedCardId) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelectedCardId(null)
        return
      }

      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, button, form, [contenteditable="true"]')) return

      if (event.key === 'ArrowLeft' && canMoveLeft && moveSelectedCard(-1)) {
        event.preventDefault()
      } else if (event.key === 'ArrowRight' && canMoveRight && moveSelectedCard(1)) {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canMoveLeft, canMoveRight, moveSelectedCard, selectedCardId])

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      {move.isError && <p role="alert">Could not move card: {move.error.message}</p>}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            selectedCardId={selectedCardId}
            onSelectCard={selectCard}
            onMoveCard={moveSelectedCard}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            isMoving={move.isPending}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
