import { useQuery } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const move = useMoveCard()
  const moving = useRef(false)
  const focusAfterMove = useRef<{ id: string; destination: string } | null>(null)
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedCardIndex = selectedColumnIndex >= 0 && selectedCardId
    ? data?.columns[selectedColumnIndex].cards.findIndex((card) => card.id === selectedCardId) ?? -1
    : -1
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

  const moveSelected = useCallback((direction: -1 | 1, axis: 'column' | 'row' = 'column') => {
    if (!data || !selectedCardId || selectedColumnIndex < 0 || editingCardId || moving.current || move.isPending) return false
    const destinationColumn = data.columns[axis === 'column' ? selectedColumnIndex + direction : selectedColumnIndex]
    const destinationPosition = axis === 'row'
      ? selectedCardIndex + direction
      : undefined
    if (!destinationColumn || (destinationPosition !== undefined && (destinationPosition < 0 || destinationPosition >= data.columns[selectedColumnIndex].cards.length))) return false
    moving.current = true
    move.reset()
    focusAfterMove.current = { id: selectedCardId, destination: destinationColumn.id }
    move.mutate({ cardId: selectedCardId, column: destinationColumn.id, position: destinationPosition }, {
      onError: () => { focusAfterMove.current = null },
      onSettled: () => { moving.current = false },
    })
    return true
  }, [data, selectedCardId, selectedColumnIndex, selectedCardIndex, editingCardId, move])

  const moveDroppedCard = useCallback((cardId: string, columnId: string, position: number) => {
    if (moving.current || move.isPending) return
    const sourceColumn = data?.columns.find((column) => column.cards.some((card) => card.id === cardId))
    const sourceIndex = sourceColumn?.cards.findIndex((card) => card.id === cardId) ?? -1
    const adjustedPosition = sourceColumn?.id === columnId && sourceIndex >= 0 && sourceIndex < position
      ? position - 1
      : position
    moving.current = true
    move.reset()
    focusAfterMove.current = { id: cardId, destination: columnId }
    move.mutate({ cardId, column: columnId, position: adjustedPosition }, {
      onSuccess: () => setSelectedCardId(cardId),
      onError: () => { focusAfterMove.current = null },
      onSettled: () => { moving.current = false },
    })
  }, [data, move])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1
        : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : null
      if (direction && moveSelected(direction, event.key === 'ArrowUp' || event.key === 'ArrowDown' ? 'row' : 'column')) event.preventDefault()
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
            <Button size="sm" disabled={selectedCardIndex <= 0 || move.isPending || !!editingCardId} onClick={() => moveSelected(-1, 'row')}>Move up</Button>
            <Button size="sm" disabled={selectedCardIndex < 0 || selectedCardIndex === data.columns[selectedColumnIndex].cards.length - 1 || move.isPending || !!editingCardId} onClick={() => moveSelected(1, 'row')}>Move down</Button>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <DndProvider backend={HTML5Backend}>
        <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }} onMoveCard={moveDroppedCard} />
      </DndProvider>
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
