import { useQuery } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { boardKey, getBoard } from '../api/board'
import { positionAfterRemoval } from '../api/boardMoves'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import Confetti from '../components/Confetti'
import { cardOrigin, makeBurst, type Burst } from '../components/confettiBurst'
import type { DraggedCard, DropTarget } from '../components/Column'
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
  const focusAfterMove = useRef<string | null>(null)
  const reducedMotion = useReducedMotion()
  const [burst, setBurst] = useState<Burst | null>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(celebrationTimer.current), [])
  const dragActive = useRef(false)
  const [dragged, setDragged] = useState<DraggedCard | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedColumn = data?.columns[selectedColumnIndex]
  const selectedCardIndex = selectedColumn?.cards.findIndex((card) => card.id === selectedCardId) ?? -1
  const selectedCard = selectedColumn?.cards[selectedCardIndex]
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  // A card that changes column is rendered as a new element, which loses focus.
  // While a move is in progress, focus the card again after each board change
  // (the immediate move, then a possible rollback), unless the user is typing in a field.
  useLayoutEffect(() => {
    const typing = document.activeElement?.closest('input, textarea, select')
    if (focusAfterMove.current && !typing) document.getElementById(cardElementId(focusAfterMove.current))?.focus({ preventScroll: true })
  }, [data])

  function selectCard(id: string) {
    if (moving.current) return
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  // Reward for a card that reached the last column (only called once the API confirmed the move).
  // Confetti, or a short text message for people who prefer reduced motion.
  const celebrate = useCallback((cardId: string, columnTitle: string) => {
    const card = document.getElementById(cardElementId(cardId))
    if (reducedMotion) {
      setDoneMessage(`🎉 Moved to ${columnTitle}`)
    } else if (card) {
      const origin = cardOrigin(card)
      setBurst(makeBurst(origin.x, origin.y))
    }
    // One timer clears the reward; a newer reward restarts it.
    clearTimeout(celebrationTimer.current)
    celebrationTimer.current = setTimeout(() => {
      setBurst(null)
      setDoneMessage(null)
    }, reducedMotion ? 4000 : 2000)
  }, [reducedMotion])

  // Sends one move. Returns false when a move cannot start now.
  const startMove = useCallback((cardId: string, column: string, position: number) => {
    if (editingCardId || moving.current || move.isPending) return false
    // Decided before the move: is the card entering the last column from another column?
    const lastColumn = data?.columns[data.columns.length - 1]
    const entersLastColumn = lastColumn?.id === column && !lastColumn.cards.some((card) => card.id === cardId)
    moving.current = true
    move.reset()
    focusAfterMove.current = cardId
    move.mutate({ cardId, column, position }, {
      onSuccess: () => {
        if (entersLastColumn && lastColumn) celebrate(cardId, lastColumn.title)
      },
      onSettled: () => {
        moving.current = false
        focusAfterMove.current = null
      },
    })
    return true
  }, [data, editingCardId, move, celebrate])

  // Left/right: to the end of the neighbouring column.
  const moveToColumn = useCallback((direction: -1 | 1) => {
    const destination = data?.columns[selectedColumnIndex + direction]
    if (!data || !selectedCardId || selectedColumnIndex < 0 || !destination) return false
    return startMove(selectedCardId, destination.id, positionAfterRemoval(data, selectedCardId, destination.id, destination.cards.length))
  }, [data, selectedCardId, selectedColumnIndex, startMove])

  // Up/down: one place in the same column. Removing the card does not move the
  // cards above it and shifts the ones below up by one, so the API position is
  // simply the current index - 1 (up) or + 1 (down).
  const moveInColumn = useCallback((direction: -1 | 1) => {
    if (!selectedCardId || !selectedColumn || !selectedColumn.cards[selectedCardIndex + direction]) return false
    return startMove(selectedCardId, selectedColumn.id, selectedCardIndex + direction)
  }, [selectedCardId, selectedColumn, selectedCardIndex, startMove])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (moveToColumn(event.key === 'ArrowLeft' ? -1 : 1)) event.preventDefault()
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        // With a selected card, Up/Down only reorder it: never scroll the page, even at an edge.
        event.preventDefault()
        moveInColumn(event.key === 'ArrowUp' ? -1 : 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveToColumn, moveInColumn])

  const busy = move.isPending || !!editingCardId
  const isLastInColumn = selectedCardIndex === (selectedColumn?.cards.length ?? 0) - 1

  function startDrag(cardId: string, height: number) {
    // Wait one tick: changing the page while the browser is still starting the drag
    // would fade the drag image and can shift the board under the pointer.
    dragActive.current = true
    setTimeout(() => {
      if (!dragActive.current) return // the drag already ended
      move.reset()
      setSelectedCardId(cardId)
      setDragged({ cardId, height })
      document.getElementById(cardElementId(cardId))?.focus({ preventScroll: true })
    })
  }

  // Called again and again while a card is dragged over a column, with the index
  // under the pointer. Returns true when the card may be dropped in that column.
  function showDropTarget(columnId: string, index: number) {
    if (!data || !dragged) return false
    const fromColumnIndex = data.columns.findIndex((column) => column.cards.some((card) => card.id === dragged.cardId))
    const toColumnIndex = data.columns.findIndex((column) => column.id === columnId)
    // A card can go to its own column or to the column right next to it, not further.
    if (fromColumnIndex === -1 || toColumnIndex === -1 || Math.abs(toColumnIndex - fromColumnIndex) > 1) {
      setDropTarget(null)
      return false
    }
    // In its own column, just above or just below the card itself: dropping there
    // would change nothing, so no placeholder. (currentIndex is -1 in another column.)
    const currentIndex = data.columns[toColumnIndex].cards.findIndex((card) => card.id === dragged.cardId)
    const changesNothing = currentIndex !== -1 && (index === currentIndex || index === currentIndex + 1)
    const next = changesNothing ? null : { columnId, index }
    // Only update when the target really changed, to avoid a re-render on every dragover.
    const samePlace = next?.columnId === dropTarget?.columnId && next?.index === dropTarget?.index
    if (!samePlace) setDropTarget(next)
    return true
  }

  function clearDropTarget(columnId: string) {
    if (dropTarget?.columnId === columnId) setDropTarget(null)
  }

  function dropCard() {
    if (data && dragged && dropTarget) {
      startMove(dragged.cardId, dropTarget.columnId, positionAfterRemoval(data, dragged.cardId, dropTarget.columnId, dropTarget.index))
    }
    endDrag()
  }

  // Runs after every drag: after a drop, a cancel (Escape) or a drop outside any column.
  function endDrag() {
    dragActive.current = false
    setDragged(null)
    setDropTarget(null)
  }

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      <Box mb={4} minH="3rem">
        {selectedCard && (
          <HStack flexWrap="wrap" gap={3}>
            <Text>Selected: {selectedCard.title}</Text>
            <Button size="sm" disabled={selectedColumnIndex === 0 || busy} onClick={() => moveToColumn(-1)}>Move left</Button>
            <Button size="sm" disabled={selectedColumnIndex === data.columns.length - 1 || busy} onClick={() => moveToColumn(1)}>Move right</Button>
            <Button size="sm" disabled={selectedCardIndex === 0 || busy} onClick={() => moveInColumn(-1)}>Move up</Button>
            <Button size="sm" disabled={isLastInColumn || busy} onClick={() => moveInColumn(1)}>Move down</Button>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <Confetti burst={burst} />
      {/* Fixed at the bottom of the window so it never pushes the board down. */}
      {doneMessage && (
        <Text role="status" position="fixed" bottom={4} left="50%" transform="translateX(-50%)" zIndex={1300}
          bg="bg.panel" borderWidth="1px" borderRadius="md" shadow="md" px={4} py={2}>
          {doneMessage}
        </Text>
      )}
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }}
        drag={{ canDrag: !busy, dragged, dropTarget, onStart: startDrag, onOver: showDropTarget, onLeave: clearDropTarget, onDrop: dropCard, onEnd: endDrag }}
      />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
