import { useIsMutating, useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Button, HStack, Text, VisuallyHidden } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { placeCard, type MoveCardInput } from '../api/placement'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'
import type { CardLanding, DragPosition } from '../components/CardDragPreview'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const writes = useIsMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [arrival, setArrival] = useState<MoveCardInput | null>(null)
  const [landing, setLanding] = useState<CardLanding | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const pendingArrival = useRef<MoveCardInput | null>(null)
  const moving = useRef(false)
  const focusAfterMove = useRef<string | null>(null)
  const move = useMoveCard((input) => {
    const rect = document.getElementById(cardElementId(input.cardId))?.getBoundingClientRect()
    pendingArrival.current = null
    setArrival(null)
    setLanding(rect ? { cardId: input.cardId, origin: { x: rect.left, y: rect.top }, returning: true } : null)
    focusAfterMove.current = input.cardId
  })
  const busy = writes > 0 || isFetching || isError || !!editingCardId || !!arrival || !!landing?.returning
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedCard = data?.columns[selectedColumnIndex]?.cards.find((card) => card.id === selectedCardId)
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  useLayoutEffect(() => {
    const pending = focusAfterMove.current
    if (pending && data?.columns.some((column) => column.cards.some((card) => card.id === pending))) {
      document.getElementById(cardElementId(pending))?.focus({ preventScroll: true })
      focusAfterMove.current = null
    }
  }, [data])

  function selectCard(id: string) {
    if (moving.current || arrival || landing?.returning) return
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  const moveTo = useCallback((input: MoveCardInput, origin?: DragPosition) => {
    const current = queryClient.getQueryData<typeof data>(boardKey)
    if (!current || busy || moving.current || queryClient.isMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' }) || queryClient.isFetching({ queryKey: boardKey, exact: true })) return false
    const placed = placeCard(current, input)
    if (placed === current) return false
    moving.current = true
    move.reset()
    setSelectedCardId(input.cardId)
    const destination = placed.columns.find((column) => column.id === input.column)!
    const target = { ...input, position: destination.cards.findIndex((card) => card.id === input.cardId) }
    pendingArrival.current = target
    setArrival(target)
    setLanding(origin ? { cardId: input.cardId, origin } : null)
    focusAfterMove.current = input.cardId
    move.mutate(input, {
      onSettled: () => { moving.current = false },
    })
    return true
  }, [queryClient, busy, move])

  const arrived = (id: string) => {
    if (landing?.returning && landing.cardId === id) {
      setLanding({ ...landing, returning: false })
      return false
    }
    if (!arrival || pendingArrival.current !== arrival || arrival.cardId !== id) return false
    const destination = data?.columns.find((column) => column.id === arrival.column)
    setAnnouncement(`${selectedCard?.title ?? 'Card'} placed in ${destination?.title ?? arrival.column}, position ${arrival.position! + 1}.`)
    pendingArrival.current = null
    setArrival(null)
    return true
  }
  const arrivingCardId = arrival && data?.columns.find((column) => column.id === arrival.column)?.cards[arrival.position!]?.id === arrival.cardId ? arrival.cardId : null

  const moveSelected = useCallback((direction: -1 | 1, vertical = false) => {
    if (!data || !selectedCardId || selectedColumnIndex < 0) return false
    const column = data.columns[selectedColumnIndex]
    if (vertical) {
      const index = column.cards.findIndex((card) => card.id === selectedCardId) + direction
      if (index < 0 || index >= column.cards.length) return false
      return moveTo({ cardId: selectedCardId, column: column.id, position: index })
    }
    const destination = data.columns[selectedColumnIndex + direction]
    return destination ? moveTo({ cardId: selectedCardId, column: destination.id }) : false
  }, [data, selectedCardId, selectedColumnIndex, moveTo])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : null
      if (direction) {
        event.preventDefault()
        moveSelected(direction, event.key === 'ArrowUp' || event.key === 'ArrowDown')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveSelected])

  if (isPending) return <p role="status">Loading board…</p>
  if (!data) return <p role="alert">Could not load board: {error?.message} <Button onClick={() => void refetch()}>Retry</Button></p>
  return (
    <>
      <Box mb={4} minH="3rem">
        <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
        {selectedCard && (
          <HStack flexWrap="wrap" gap={3}>
            <Text>Selected: {selectedCard.title}</Text>
            <Button size="sm" disabled={selectedColumnIndex === 0 || busy} onClick={() => moveSelected(-1)}>Move left</Button>
            <Button size="sm" disabled={selectedColumnIndex === data.columns.length - 1 || busy} onClick={() => moveSelected(1)}>Move right</Button>
            <Text color="fg.muted" fontSize="sm">↑ ↓ Reorder · ← → Change column</Text>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
        {isError && <Text role="alert" color="red.700">Could not refresh board: {error.message}. <Button size="xs" onClick={() => void refetch()}>Retry</Button></Text>}
      </Box>
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current && !arrival && !landing?.returning) setEditingCardId(id) }} disabled={busy} onMoveCard={moveTo} arrivingCardId={arrivingCardId} onArrival={arrived} landing={landing} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
