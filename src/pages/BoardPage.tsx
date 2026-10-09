import { useQuery } from '@tanstack/react-query'
import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { dropPosition } from '../api/moves'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { Celebration } from '../components/Celebration'
import { EditCardDrawer } from '../components/EditCardDrawer'
import { withoutEmoji } from '../components/withoutEmoji'

const doneColumnId = 'done'

type Direction = 'left' | 'right' | 'up' | 'down'
const keyDirections: Record<string, Direction> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

// Viewport centre of an element's layout box. Offsets ignore CSS transforms, so this
// is where the card lands even while Motion is still animating it there.
function landingPoint(element: HTMLElement) {
  let x = element.offsetWidth / 2
  let y = element.offsetHeight / 2
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x: x - window.scrollX, y: y - window.scrollY }
}

export function BoardPage() {
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [celebration, setCelebration] = useState<{ id: number; origin: { x: number; y: number }; title: string } | null>(null)
  const endCelebration = useCallback(() => setCelebration(null), [])
  const reducedMotion = useReducedMotion()
  const move = useMoveCard()
  const focusAfterMove = useRef<{ id: string; destination: string } | null>(null)
  const celebrateCardId = useRef<string | null>(null)
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedColumn = data?.columns[selectedColumnIndex]
  const selectedIndex = selectedColumn?.cards.findIndex((card) => card.id === selectedCardId) ?? -1
  const selectedCard = selectedColumn?.cards[selectedIndex]
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  // Moves are optimistic, so these run on the render that shows the card in its new place.
  useLayoutEffect(() => {
    const pending = focusAfterMove.current
    if (pending && data?.columns.some((column) => column.id === pending.destination && column.cards.some((card) => card.id === pending.id))) {
      document.getElementById(cardElementId(pending.id))?.focus({ preventScroll: true })
      focusAfterMove.current = null
    }
    const celebrated = celebrateCardId.current
    const celebratedCard = celebrated && data?.columns.find((column) => column.id === doneColumnId)?.cards.find((card) => card.id === celebrated)
    if (celebratedCard) {
      const element = document.getElementById(cardElementId(celebratedCard.id))
      if (element) setCelebration((current) => ({ id: (current?.id ?? 0) + 1, origin: landingPoint(element), title: withoutEmoji(celebratedCard.title) }))
      celebrateCardId.current = null
    }
  }, [data])

  function selectCard(id: string) {
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  // Every way of moving (keys, buttons, drag and drop) ends here. `position` follows the
  // API: the index in `column` once the card has left its current place; omitted appends.
  const moveCard = useCallback((cardId: string, column: string, position?: number) => {
    const source = data?.columns.find((item) => item.cards.some((card) => card.id === cardId))
    if (!source) return
    move.reset()
    focusAfterMove.current = { id: cardId, destination: column }
    if (column === doneColumnId && source.id !== doneColumnId && !reducedMotion) celebrateCardId.current = cardId
    move.mutate({ cardId, column, position }, {
      onError: () => { focusAfterMove.current = null },
    })
  }, [data, move, reducedMotion])

  const moveSelected = useCallback((direction: Direction) => {
    if (!data || !selectedCardId || !selectedColumn || editingCardId) return false
    if (direction === 'left' || direction === 'right') {
      const destination = data.columns[selectedColumnIndex + (direction === 'left' ? -1 : 1)]
      if (!destination) return false
      moveCard(selectedCardId, destination.id)
    } else {
      const position = selectedIndex + (direction === 'up' ? -1 : 1)
      if (position < 0 || position >= selectedColumn.cards.length) return false
      moveCard(selectedCardId, selectedColumn.id, position)
    }
    return true
  }, [data, selectedCardId, selectedColumn, selectedColumnIndex, selectedIndex, editingCardId, moveCard])

  const dropCard = useCallback((cardId: string, columnId: string, index: number) => {
    const position = data ? dropPosition(data, cardId, columnId, index) : null
    if (position !== null) moveCard(cardId, columnId, position)
  }, [data, moveCard])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      const direction = keyDirections[event.key]
      if (direction && moveSelected(direction)) event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveSelected])

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  const lastColumn = data.columns.length - 1
  const lastCard = (selectedColumn?.cards.length ?? 0) - 1
  return (
    <>
      <Box mb={5} minH="3.25rem">
        {selectedCard && (
          <div className="board-toolbar panel">
            <Text>Selected: <strong>{withoutEmoji(selectedCard.title)}</strong></Text>
            <HStack gap={1}>
              <IconButton size="sm" variant="ghost" className="move-button" aria-label="Move left" title="Move left (←)" disabled={selectedColumnIndex === 0 || !!editingCardId} onClick={() => moveSelected('left')}><ArrowLeft /></IconButton>
              <IconButton size="sm" variant="ghost" className="move-button" aria-label="Move up" title="Move up (↑)" disabled={selectedIndex === 0 || !!editingCardId} onClick={() => moveSelected('up')}><ArrowUp /></IconButton>
              <IconButton size="sm" variant="ghost" className="move-button" aria-label="Move down" title="Move down (↓)" disabled={selectedIndex === lastCard || !!editingCardId} onClick={() => moveSelected('down')}><ArrowDown /></IconButton>
              <IconButton size="sm" variant="ghost" className="move-button" aria-label="Move right" title="Move right (→)" disabled={selectedColumnIndex === lastColumn || !!editingCardId} onClick={() => moveSelected('right')}><ArrowRight /></IconButton>
            </HStack>
            {move.isPending && <Text role="status" className="board-status" pr={2}>Saving move…</Text>}
          </div>
        )}
        {move.isError && <Text role="alert" color="red.fg" className="board-alert">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={setEditingCardId} onDropCard={dropCard} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
      {celebration && createPortal(
        // A new key restarts the show when another card reaches Done mid-celebration.
        <Celebration key={celebration.id} origin={celebration.origin} title={celebration.title} onDone={endCelebration} />,
        document.body,
      )}
    </>
  )
}
