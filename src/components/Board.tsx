import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useMoveCard } from '../api/mutations'
import type { BoardData, UserData } from '../types/board'
import { Column } from './Column'
import Confetti from './Confetti'
import { canAcceptCard, getColumnLimit } from './columnLimit'
import { useRefusedCard } from './useRefusedCard'

type BoardProps = { board: BoardData; users: UserData[]; usersLoading: boolean }
type DropMarker = { columnId: string; cardId: string | null; after: boolean }
type MoveMutation = ReturnType<typeof useMoveCard>['mutate']
type RequestMove = (cardId: string, columnId: string, position: number, allowNonAdjacent?: boolean) => void

function submitMove(
  board: BoardData,
  cardId: string,
  columnId: string,
  position: number,
  mutate: MoveMutation,
  onFinalArrival: () => void,
  allowNonAdjacent = false,
) {
  const sourceIndex = board.columns.findIndex((column) =>
    column.cards.some((card) => card.id === cardId))
  const destinationIndex = board.columns.findIndex((column) => column.id === columnId)
  const source = board.columns[sourceIndex]
  const destination = board.columns[destinationIndex]
  if (!source || !destination || (!allowNonAdjacent && Math.abs(sourceIndex - destinationIndex) > 1)) return

  const currentIndex = source.cards.findIndex((card) => card.id === cardId)
  const destinationLength = destination.cards.length - (sourceIndex === destinationIndex ? 1 : 0)
  if (!Number.isInteger(position) || position < 0 || position > destinationLength ||
    (sourceIndex === destinationIndex && position === currentIndex)) return

  const arrivesInFinalColumn = destinationIndex === board.columns.length - 1 &&
    sourceIndex !== destinationIndex
  mutate({ cardId, columnId, position }, {
    onSuccess: () => {
      if (arrivesInFinalColumn) onFinalArrival()
    },
  })
}

function moveInDirection(
  board: BoardData,
  cardId: string,
  direction: 'up' | 'down' | 'left' | 'right',
  requestMove: RequestMove,
) {
  const sourceIndex = board.columns.findIndex((column) =>
    column.cards.some((card) => card.id === cardId))
  const source = board.columns[sourceIndex]
  if (!source) return

  if (direction === 'left' || direction === 'right') {
    const destination = board.columns[sourceIndex + (direction === 'left' ? -1 : 1)]
    if (destination) {
      requestMove(cardId, destination.id, destination.cards.length)
    }
    return
  }

  const cardIndex = source.cards.findIndex((card) => card.id === cardId)
  const position = cardIndex + (direction === 'up' ? -1 : 1)
  if (position >= 0 && position < source.cards.length) {
    requestMove(cardId, source.id, position)
  }
}

export function Board({ board, users, usersLoading }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [dropMarker, setDropMarker] = useState<DropMarker | null>(null)
  const [celebrationCount, setCelebrationCount] = useState(0)
  const [refusalMessage, setRefusalMessage] = useState<string | null>(null)
  const { mutate, isPending, isError, error } = useMoveCard()
  const { refusedCardId, refuse } = useRefusedCard()

  const celebrateFinalArrival = useCallback(() => {
    setCelebrationCount((current) => current + 1)
  }, [])

  const requestMove = useCallback((cardId: string, columnId: string, position: number, allowNonAdjacent = false) => {
    const sourceIndex = board.columns.findIndex((column) =>
      column.cards.some((card) => card.id === cardId))
    const destinationIndex = board.columns.findIndex((column) => column.id === columnId)
    const destination = board.columns[destinationIndex]
    if (sourceIndex < 0 || !destination || (!allowNonAdjacent && Math.abs(sourceIndex - destinationIndex) > 1)) return

    if (!canAcceptCard(board, columnId, cardId)) {
      const limit = getColumnLimit(board, columnId)
      const count = destination.cards.length - (sourceIndex === destinationIndex ? 1 : 0)
      setRefusalMessage(`${destination.title} is full (${count}/${limit}).`)
      refuse(cardId)
      return
    }

    setRefusalMessage(null)
    submitMove(board, cardId, columnId, position, mutate, celebrateFinalArrival, allowNonAdjacent)
  }, [board, celebrateFinalArrival, mutate, refuse])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedCardId || isPending || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('input, textarea, select, button, [contenteditable="true"]')) return
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
      const direction = event.key.slice(5).toLowerCase() as 'up' | 'down' | 'left' | 'right'
      const source = board.columns.find((column) =>
        column.cards.some((card) => card.id === selectedCardId))
      if (!source) return
      const position = direction === 'left' || direction === 'right'
        ? board.columns.indexOf(source) + (direction === 'left' ? -1 : 1)
        : source.cards.findIndex((card) => card.id === selectedCardId) + (direction === 'up' ? -1 : 1)
      if (direction === 'left' || direction === 'right') {
        if (!board.columns[position]) return
      } else if (position < 0 || position >= source.cards.length) return
      event.preventDefault()
      moveInDirection(board, selectedCardId, direction, requestMove)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [board, isPending, requestMove, selectedCardId])

  function canDropIn(columnId: string) {
    if (!draggingCardId || isPending) return false
    const sourceIndex = board.columns.findIndex((column) =>
      column.cards.some((card) => card.id === draggingCardId))
    const destinationIndex = board.columns.findIndex((column) => column.id === columnId)
    return sourceIndex >= 0 && destinationIndex >= 0
  }

  function handleDragOverCard(columnId: string, cardId: string, after: boolean) {
    if (!canDropIn(columnId)) return false
    setDropMarker({ columnId, cardId, after })
    return true
  }

  function handleDropOnCard(columnId: string, targetCardId: string, after: boolean) {
    if (!draggingCardId || draggingCardId === targetCardId || !canDropIn(columnId)) return
    const destination = board.columns.find((column) => column.id === columnId)
    if (!destination) return
    const cards = destination.cards.filter((card) => card.id !== draggingCardId)
    const targetIndex = cards.findIndex((card) => card.id === targetCardId)
    const position = targetIndex < 0 ? cards.length : targetIndex + (after ? 1 : 0)
    requestMove(draggingCardId, columnId, position, true)
    setDropMarker(null)
  }

  function handleDropInColumn(columnId: string) {
    if (!draggingCardId || !canDropIn(columnId)) return
    const destination = board.columns.find((column) => column.id === columnId)
    if (!destination) return
    const position = destination.cards.filter((card) => card.id !== draggingCardId).length
    requestMove(draggingCardId, columnId, position, true)
    setDropMarker(null)
  }

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      {isPending && <p role="status" aria-live="polite">Moving card…</p>}
      {isError && <p role="alert">Could not move card: {error.message}</p>}
      {refusalMessage && <p role="status" aria-live="polite">{refusalMessage}</p>}
      <Confetti particleCount={celebrationCount} />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column, columnIndex) => (
          <Column
            key={column.id}
            column={column}
            users={users}
            usersLoading={usersLoading}
            limit={getColumnLimit(board, column.id)}
            columnIndex={columnIndex}
            columnCount={board.columns.length}
            selectedCardId={selectedCardId}
            refusedCardId={refusedCardId}
            draggingCardId={draggingCardId}
            dropMarker={dropMarker}
            movePending={isPending}
            isDropTarget={dropMarker?.columnId === column.id && dropMarker.cardId === null}
            onSelectCard={setSelectedCardId}
            onMoveCard={(cardId, direction) => {
              setSelectedCardId(cardId)
              const sourceIndex = board.columns.findIndex((item) =>
                item.cards.some((card) => card.id === cardId))
              const source = board.columns[sourceIndex]
              if (!source) return
              if (direction === 'left' || direction === 'right') {
                const destination = board.columns[sourceIndex + (direction === 'left' ? -1 : 1)]
                if (destination) {
                  requestMove(cardId, destination.id, destination.cards.length)
                }
              } else {
                const cardIndex = source.cards.findIndex((card) => card.id === cardId)
                const position = cardIndex + (direction === 'up' ? -1 : 1)
                requestMove(cardId, source.id, position)
              }
            }}
            onDragStart={(cardId) => {
              setSelectedCardId(cardId)
              setDraggingCardId(cardId)
              setDropMarker(null)
            }}
            onDragEnd={() => {
              setDraggingCardId(null)
              setDropMarker(null)
            }}
            onDragOverCard={handleDragOverCard}
            onDropOnCard={handleDropOnCard}
            onDragOverColumn={(columnId) => {
              if (!canDropIn(columnId)) return false
              setDropMarker({ columnId, cardId: null, after: true })
              return true
            }}
            onDropInColumn={handleDropInColumn}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
