import { useQuery } from '@tanstack/react-query'
import { Box, Text } from '@chakra-ui/react'
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
  const [celebration, setCelebration] = useState<{ cardId: string; token: number } | null>(null)
  const celebrationToken = celebration?.token ?? 0
  const [announcement, setAnnouncement] = useState('')
  const [isMoving, setIsMoving] = useState(false)
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

  const moveCard = useCallback((cardId: string, destination: string, position: number, sourceColumn: string) => {
    if (!data || moving.current || move.isPending || editingCardId) return
    const destinationColumn = data.columns.find((column) => column.id === destination)
    if (!destinationColumn) return

    moving.current = true
    setIsMoving(true)
    setSelectedCardId(cardId)
    move.reset()
    focusAfterMove.current = { id: cardId, destination }
    move.mutate({ cardId, column: destination, position }, {
      onSuccess: () => {
        const destinationIndex = data.columns.findIndex((column) => column.id === destination)
        if (sourceColumn !== destination && destinationIndex === data.columns.length - 1) {
          setCelebration((current) => ({ cardId, token: (current?.token ?? 0) + 1 }))
        } else {
          setCelebration(null)
        }
        setAnnouncement(`Moved card to ${destinationColumn.title}, position ${position + 1}.`)
      },
      onError: (requestError) => {
        focusAfterMove.current = null
        setAnnouncement(`Could not move card: ${requestError.message}. Try again.`)
      },
      onSettled: () => {
        moving.current = false
        setIsMoving(false)
      },
    })
  }, [data, editingCardId, move])

  const moveSelected = useCallback((columnOffset: -1 | 1, position?: number) => {
    if (!data || !selectedCardId || selectedColumnIndex < 0 || editingCardId || moving.current || move.isPending) return false
    const sourceColumn = data.columns[selectedColumnIndex]
    const destination = data.columns[selectedColumnIndex + columnOffset]
    if (!destination) return false
    moveCard(selectedCardId, destination.id, position ?? destination.cards.length, sourceColumn.id)
    return true
  }, [data, selectedCardId, selectedColumnIndex, editingCardId, move.isPending, moveCard])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') {
        setSelectedCardId(null)
        setAnnouncement('Selection cleared.')
        return
      }
      if (!data || selectedColumnIndex < 0 || moving.current || move.isPending) return
      const column = data.columns[selectedColumnIndex]
      const cardId = selectedCardId
      if (!cardId) return
      const cardIndex = column.cards.findIndex((card) => card.id === cardId)
      if (cardIndex < 0) return

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        if (moveSelected(direction)) event.preventDefault()
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const offset = event.key === 'ArrowUp' ? -1 : 1
        const position = cardIndex + offset
        if (position >= 0 && position < column.cards.length) {
          moveCard(cardId, column.id, position, column.id)
          event.preventDefault()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [data, selectedCardId, selectedColumnIndex, editingCardId, move.isPending, moveCard, moveSelected])

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>
  return (
    <>
      <Box mb={4} minH="3rem">
        <Text role="status" aria-live="polite" position="absolute" width="1px" height="1px" overflow="hidden" clip="rect(0 0 0 0)">{announcement}</Text>
      </Box>
      <Board
        board={data}
        selectedCardId={selectedCardId}
        onSelectCard={(id) => {
          if (!moving.current) {
            move.reset()
            setSelectedCardId((current) => current === id ? null : id)
            document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
          }
        }}
        onEditCard={(id) => { if (!moving.current) setEditingCardId(id) }}
        moving={isMoving || move.isPending}
        celebrationCardId={celebration?.cardId ?? null}
        celebrationToken={celebrationToken}
        onMoveCard={moveCard}
      />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
