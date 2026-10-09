import { useQuery } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'
import Confetti from '../components/Confetti'
import { entersLastColumn, moveCardToPosition, moveCardWithinColumn, type MoveDirection } from '../domain/boardMovement'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [confettiBurst, setConfettiBurst] = useState(0)
  const move = useMoveCard()
  const moving = useRef(false)
  const focusAfterMove = useRef<{ id: string; destination: string } | null>(null)
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedCard = data?.columns[selectedColumnIndex]?.cards.find((card) => card.id === selectedCardId)
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  useLayoutEffect(() => {
    const pending = focusAfterMove.current
    if (pending && data?.columns.some((column) => column.id === pending.destination && column.cards.some((card) => card.id === pending.id))) {
      document.getElementById(cardElementId(pending.id))?.focus({ preventScroll: true })
      focusAfterMove.current = null
    }
  }, [data])

  function selectCard(id: string) {
    if (moving.current) return
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  const moveCard = useCallback((cardId: string, columnId: string, position?: number) => {
    if (!data || editingCardId || moving.current || move.isPending) return false
    const destination = data.columns.find((column) => column.id === columnId)
    if (!destination) return false
    const next = moveCardToPosition(data, cardId, columnId, position ?? destination.cards.length)
    if (!next) return false
    moving.current = true
    move.reset()
    focusAfterMove.current = { id: cardId, destination: destination.id }
    if (entersLastColumn(data, next, cardId)) setConfettiBurst((value) => value + 1)
    move.mutate({ cardId, column: destination.id, ...(position === undefined ? {} : { position }) }, {
      onError: () => { focusAfterMove.current = null },
      onSettled: () => { moving.current = false },
    })
    return true
  }, [data, editingCardId, move])

  const moveSelected = useCallback((direction: -1 | 1 | MoveDirection) => {
    if (!data || !selectedCardId || selectedColumnIndex < 0 || editingCardId || moving.current || move.isPending) return false
    const column = data.columns[selectedColumnIndex]
    if (direction === 'up' || direction === 'down') {
      const next = moveCardWithinColumn(data, selectedCardId, direction)
      if (!next) return false
      const position = next.columns[selectedColumnIndex].cards.findIndex((card) => card.id === selectedCardId)
      return moveCard(selectedCardId, column.id, position)
    }
    const destination = data.columns[selectedColumnIndex + direction]
    if (!destination) return false
    return moveCard(selectedCardId, destination.id)
  }, [data, selectedCardId, selectedColumnIndex, editingCardId, move, moveCard])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' ? 'up' : event.key === 'ArrowDown' ? 'down' : null
      if (direction && moveSelected(direction)) event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveSelected])

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      <Box mb={4} minH="3rem">
        {selectedCard && (
          <HStack flexWrap="wrap" gap={3}>
            <Text>Selected: {selectedCard.title}</Text>
            <Button size="sm" disabled={selectedColumnIndex === 0 || move.isPending || !!editingCardId} onClick={() => moveSelected(-1)}>Move left</Button>
            <Button size="sm" disabled={selectedColumnIndex === data.columns.length - 1 || move.isPending || !!editingCardId} onClick={() => moveSelected(1)}>Move right</Button>
            <Button size="sm" disabled={move.isPending || !!editingCardId || !selectedCardId || !moveCardWithinColumn(data, selectedCardId, 'up')} onClick={() => moveSelected('up')}>Move up</Button>
            <Button size="sm" disabled={move.isPending || !!editingCardId || !selectedCardId || !moveCardWithinColumn(data, selectedCardId, 'down')} onClick={() => moveSelected('down')}>Move down</Button>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <Confetti particleCount={confettiBurst} />
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }} onMoveCard={(cardId, columnId, position) => moveCard(cardId, columnId, position)} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
