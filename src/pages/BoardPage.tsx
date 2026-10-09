import { useQuery } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard, type MoveCardInput } from '../api/mutations'
import { useReducedMotion } from 'motion/react'
import { Board } from '../components/Board'
import type { DropPoint } from '../components/cardDrag'
import { cardElementId } from '../components/cardIds'
import Confetti from '../components/Confetti'
import { EditCardDrawer } from '../components/EditCardDrawer'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

type MoveDirection = 'left' | 'right' | 'up' | 'down'

const arrowDirections: Partial<Record<string, MoveDirection>> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
}

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const move = useMoveCard()
  const focusAfterMove = useRef<{ id: string; destination: string } | null>(null)
  const reducedMotion = useReducedMotion()
  const [burst, setBurst] = useState<{ count: number; x: number; y: number } | null>(null)
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedColumn = data?.columns[selectedColumnIndex]
  const selectedCardIndex = selectedColumn?.cards.findIndex((card) => card.id === selectedCardId) ?? -1
  const selectedCard = selectedColumn?.cards[selectedCardIndex]
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  useLayoutEffect(() => {
    const pending = focusAfterMove.current
    if (pending && data?.columns.some((column) => column.id === pending.destination && column.cards.some((card) => card.id === pending.id))) {
      document.getElementById(cardElementId(pending.id))?.focus({ preventScroll: true })
      focusAfterMove.current = null
    }
  }, [data])

  function selectCard(id: string) {
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  // Moves are optimistic and queued, so they are accepted while earlier ones are in flight.
  // A promise per call: mutate()'s per-call callbacks only fire for the latest call.
  const { mutateAsync: mutateMove, reset: resetMove } = move
  const requestMove = useCallback((input: MoveCardInput, focus: boolean, onSuccess?: () => void) => {
    resetMove()
    if (focus) focusAfterMove.current = { id: input.cardId, destination: input.column }
    mutateMove(input).then(onSuccess, () => { focusAfterMove.current = null })
  }, [mutateMove, resetMove])

  // Bursts where the card arrives once the server has accepted the drop. The point is
  // measured at drop time: the card is still mid-animation when the server answers.
  function celebrate({ x, y }: DropPoint) {
    if (reducedMotion) return
    setBurst((current) => ({ count: (current?.count ?? 0) + 1, x, y }))
  }

  // Left/Right append to the neighbouring column; Up/Down swap with the neighbouring card.
  // Moves past the board's edges are no-ops.
  const moveSelected = useCallback((direction: MoveDirection) => {
    if (!data || !selectedCardId || !selectedColumn || editingCardId) return
    const vertical = direction === 'up' || direction === 'down'
    const destination = vertical ? selectedColumn : data.columns[selectedColumnIndex + (direction === 'left' ? -1 : 1)]
    const position = vertical ? selectedCardIndex + (direction === 'up' ? -1 : 1) : undefined
    if (!destination || (position !== undefined && (position < 0 || position >= selectedColumn.cards.length))) return
    requestMove({ cardId: selectedCardId, column: destination.id, position }, true)
  }, [data, selectedCardId, selectedColumn, selectedColumnIndex, selectedCardIndex, editingCardId, requestMove])

  // `slot` counts the cards above the drop line, the dragged card included.
  function dropCard(cardId: string, columnId: string, slot: number, point: DropPoint) {
    if (!data || editingCardId) return
    const source = data.columns.find((column) => column.cards.some((card) => card.id === cardId))
    if (!source) return
    const index = source.cards.findIndex((card) => card.id === cardId)
    if (source.id === columnId && (slot === index || slot === index + 1)) return
    requestMove({ cardId, column: columnId, position: source.id === columnId && slot > index ? slot - 1 : slot }, false, () => celebrate(point))
  }

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      const direction = arrowDirections[event.key]
      if (!direction) return
      // Arrows belong to the selected card, even at an edge, so the page never scrolls instead.
      event.preventDefault()
      moveSelected(direction)
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
            <Button size="sm" disabled={selectedColumnIndex === 0 || !!editingCardId} onClick={() => moveSelected('left')}>Move left</Button>
            <Button size="sm" disabled={selectedColumnIndex === data.columns.length - 1 || !!editingCardId} onClick={() => moveSelected('right')}>Move right</Button>
            <Button size="sm" disabled={selectedCardIndex === 0 || !!editingCardId} onClick={() => moveSelected('up')}>Move up</Button>
            <Button size="sm" disabled={selectedCardIndex === (selectedColumn?.cards.length ?? 0) - 1 || !!editingCardId} onClick={() => moveSelected('down')}>Move down</Button>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <Board board={data} selectedCardId={selectedCardId} dragDisabled={!!editingCardId} onSelectCard={selectCard} onEditCard={setEditingCardId} onDropCard={dropCard} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
      {burst && (
        <Box aria-hidden position="fixed" left={`${burst.x}px`} top={`${burst.y}px`} zIndex="overlay" pointerEvents="none">
          <Confetti particleCount={burst.count} />
        </Box>
      )}
    </>
  )
}
