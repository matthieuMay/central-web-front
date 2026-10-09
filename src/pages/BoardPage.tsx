import { useQuery } from '@tanstack/react-query'
import { Box, Button, HStack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'
import type { DragCard } from '../components/Card'
import { SessionChooser } from '../components/SessionPanel'
import { useSession } from '../session/SessionContext'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const session = useSession()
  const { data, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [confettiCardId, setConfettiCardId] = useState<string | null>(null)
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
    setSelectedCardId(id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  const moveSelected = useCallback((direction: -1 | 1, axis: 'horizontal' | 'vertical' = 'horizontal') => {
    if (!data || !selectedCardId || selectedColumnIndex < 0 || editingCardId || moving.current || move.isPending) return false
    const source = data.columns[selectedColumnIndex]
    const sourcePosition = source.cards.findIndex((card) => card.id === selectedCardId)
    const destination = axis === 'horizontal' ? data.columns[selectedColumnIndex + direction] : source
    if (!destination) return false
    const position = axis === 'vertical'
      ? sourcePosition + direction
      : Math.min(sourcePosition, destination.cards.length)
    if (position < 0 || position > (axis === 'vertical' ? source.cards.length - 1 : destination.cards.length)) return false
    if (axis === 'vertical' && position === sourcePosition) return false
    moving.current = true
    move.reset()
    focusAfterMove.current = { id: selectedCardId, destination: destination.id }
    move.mutate({ cardId: selectedCardId, column: destination.id, position }, {
      onError: () => { focusAfterMove.current = null },
      onSettled: () => { moving.current = false },
    })
    return true
  }, [data, selectedCardId, selectedColumnIndex, editingCardId, move])

  const dropCard = useCallback((item: DragCard, columnId: string, position: number) => {
    if (!data || moving.current || move.isPending) return
    const sourceColumn = data.columns.find((column) => column.cards.some((card) => card.id === item.cardId))
    const destination = data.columns.find((column) => column.id === columnId)
    if (!sourceColumn || !destination) return
    const sourcePosition = sourceColumn.cards.findIndex((card) => card.id === item.cardId)
    const maxPosition = destination.cards.length - (sourceColumn.id === destination.id ? 1 : 0)
    const finalPosition = Math.max(0, Math.min(position, maxPosition))
    if (sourceColumn.id === destination.id && finalPosition === sourcePosition) return
    moving.current = true
    setConfettiCardId(null)
    setSelectedCardId(item.cardId)
    focusAfterMove.current = { id: item.cardId, destination: destination.id }
    move.mutate({ cardId: item.cardId, column: destination.id, position: finalPosition }, {
      onSuccess: () => {
        if (finalPosition === maxPosition) setConfettiCardId(item.cardId)
      },
      onError: () => { focusAfterMove.current = null },
      onSettled: () => { moving.current = false },
    })
  }, [data, move])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : null
      if (direction) {
        const axis = event.key === 'ArrowLeft' || event.key === 'ArrowRight' ? 'horizontal' : 'vertical'
        if (moveSelected(direction, axis)) event.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveSelected])

  if (session.user === undefined) return <SessionChooser />
  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      <Box mb={4} minH="3rem">
        {selectedCard && (
          <HStack flexWrap="wrap" gap={3}>
            <Text>Selected: {selectedCard.title}</Text>
            <Button type="button" size="sm" disabled={selectedColumnIndex === 0 || move.isPending || !!editingCardId} onClick={() => moveSelected(-1)}>Move left</Button>
            <Button type="button" size="sm" disabled={selectedColumnIndex === data.columns.length - 1 || move.isPending || !!editingCardId} onClick={() => moveSelected(1)}>Move right</Button>
            {move.isPending && <Text role="status">Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}. Try again.</Text>}
      </Box>
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }} confettiCardId={confettiCardId} onDropCard={dropCard} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
