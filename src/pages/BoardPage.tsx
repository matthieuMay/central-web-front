import { useIsMutating, useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { placeCard, type MoveCardInput } from '../api/placement'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const writes = useIsMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const move = useMoveCard()
  const moving = useRef(false)
  const focusAfterMove = useRef<string | null>(null)
  const busy = writes > 0 || isFetching || isError || !!editingCardId
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
    if (moving.current) return
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  const moveTo = useCallback((input: MoveCardInput) => {
    const current = queryClient.getQueryData<typeof data>(boardKey)
    if (!current || busy || moving.current || queryClient.isMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' }) || queryClient.isFetching({ queryKey: boardKey, exact: true })) return false
    if (placeCard(current, input) === current) return false
    moving.current = true
    move.reset()
    setSelectedCardId(input.cardId)
    focusAfterMove.current = input.cardId
    move.mutate(input, {
      onError: () => { focusAfterMove.current = input.cardId },
      onSettled: () => { moving.current = false },
    })
    return true
  }, [queryClient, busy, move])

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
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
