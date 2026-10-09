import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Alert, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { BoardData, CardCollectionsUpdate, CardData, UserData, Urgency } from '../types/board'
import { Column } from './Column'
import Confetti from './Confetti'

type BoardProps = { board: BoardData }
const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/api'
const urgencyRank: Record<Urgency, number> = {
  extremely_urgent: 0,
  very_urgent: 1,
  moderately_urgent: 2,
  softly_urgent: 3,
}

export function Board({ board }: BoardProps) {
  const [currentBoard, setCurrentBoard] = useState(board)
  const [users, setUsers] = useState<UserData[]>([])
  const [isReady, setIsReady] = useState(false)
  const [movingCardId, setMovingCardId] = useState<string | null>(null)
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confettiCount, setConfettiCount] = useState(0)
  const focusCardId = useRef<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([
      fetch(`${apiBaseUrl}/boards/${encodeURIComponent(board.id)}`),
      fetch(`${apiBaseUrl}/users`),
    ])
      .then(async ([boardResponse, usersResponse]) => {
        if (!boardResponse.ok) throw new Error(`Unable to load board (${boardResponse.status})`)
        if (!usersResponse.ok) throw new Error(`Unable to load members (${usersResponse.status})`)
        return await Promise.all([
          boardResponse.json() as Promise<BoardData>,
          usersResponse.json() as Promise<UserData[]>,
        ])
      })
      .then(([loadedBoard, loadedUsers]) => {
        if (!active) return
        setCurrentBoard(loadedBoard)
        setUsers(loadedUsers)
        setIsReady(true)
        setError(null)
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(loadError instanceof Error ? loadError.message : 'Unable to load board')
      })

    return () => { active = false }
  }, [board.id])

  useEffect(() => {
    const cardId = focusCardId.current
    if (!cardId) return
    document.querySelector<HTMLElement>(`[data-card-id="${cardId}"]`)?.focus()
    focusCardId.current = null
  }, [currentBoard])

  async function moveCard(cardId: string, destinationColumnId: string, position?: number) {
    if (!isReady || movingCardId || updatingCardId) return

    const sourceColumn = currentBoard.columns.find((column) =>
      column.cards.some((card) => card.id === cardId))
    if (!sourceColumn || (sourceColumn.id === destinationColumnId && position === undefined)) return

    setMovingCardId(cardId)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/cards/${encodeURIComponent(cardId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column: destinationColumnId,
          ...(position === undefined ? {} : { position }),
        }),
      })
      const result = await response.json() as BoardData | { error?: string }
      if (!response.ok) {
        throw new Error('error' in result && result.error ? result.error : `Unable to move card (${response.status})`)
      }

      setCurrentBoard(result as BoardData)
      focusCardId.current = cardId
      if (sourceColumn.id !== destinationColumnId &&
          destinationColumnId === currentBoard.columns.at(-1)?.id) {
        setConfettiCount((count) => count + 1)
      }
    } catch (moveError: unknown) {
      setError(moveError instanceof Error ? moveError.message : 'Unable to move card')
    } finally {
      setMovingCardId(null)
    }
  }

  async function updateCard(cardId: string, changes: CardCollectionsUpdate): Promise<boolean> {
    if (!isReady || movingCardId || updatingCardId) return false

    setUpdatingCardId(cardId)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/cards/${encodeURIComponent(cardId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      const result = await response.json() as CardData | { error?: string }
      if (!response.ok) {
        throw new Error('error' in result && result.error ? result.error : `Unable to update card (${response.status})`)
      }

      const updatedCard = result as CardData
      setCurrentBoard((current) => ({
        ...current,
        columns: current.columns.map((column) => ({
          ...column,
          cards: column.cards
            .map((card) => card.id === cardId ? updatedCard : card)
              .sort((left, right) => urgencyRank[left.urgency ?? 'softly_urgent'] -
                urgencyRank[right.urgency ?? 'softly_urgent']),
        })),
      }))
      return true
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update card')
      return false
    } finally {
      setUpdatingCardId(null)
    }
  }

  function handleKeyDown(cardId: string, event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return
    const columnIndex = currentBoard.columns.findIndex((column) =>
      column.cards.some((card) => card.id === cardId))
    if (columnIndex < 0) return

    const column = currentBoard.columns[columnIndex]
    const cardIndex = column.cards.findIndex((card) => card.id === cardId)
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        if (columnIndex > 0) void moveCard(cardId, currentBoard.columns[columnIndex - 1].id)
        break
      case 'ArrowRight':
        event.preventDefault()
        if (columnIndex < currentBoard.columns.length - 1) void moveCard(cardId, currentBoard.columns[columnIndex + 1].id)
        break
      case 'ArrowUp':
        event.preventDefault()
        if (cardIndex > 0) void moveCard(cardId, column.id, cardIndex - 1)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (cardIndex < column.cards.length - 1) void moveCard(cardId, column.id, cardIndex + 1)
        break
    }
  }

  function handleCardDrop(
    event: DragEvent<HTMLElement>,
    destinationColumnId: string,
    targetCardId: string,
    targetIndex: number,
  ) {
    event.preventDefault()
    event.stopPropagation()
    if (!draggingCardId || draggingCardId === targetCardId) return

    const sourceColumn = currentBoard.columns.find((column) =>
      column.cards.some((card) => card.id === draggingCardId))
    const sourceColumnIndex = currentBoard.columns.findIndex((column) => column.id === sourceColumn?.id)
    const destinationColumnIndex = currentBoard.columns.findIndex((column) => column.id === destinationColumnId)
    if (sourceColumnIndex < 0 || Math.abs(sourceColumnIndex - destinationColumnIndex) > 1) return
    const targetBounds = event.currentTarget.getBoundingClientRect()
    const targetPosition = targetIndex + (event.clientY >= targetBounds.top + targetBounds.height / 2 ? 1 : 0)
    const position = sourceColumn?.id === destinationColumnId &&
      sourceColumn.cards.findIndex((card) => card.id === draggingCardId) < targetPosition
      ? targetPosition - 1
      : targetPosition

    void moveCard(draggingCardId, destinationColumnId, position)
  }

  function handleColumnDrop(event: DragEvent<HTMLElement>, destinationColumnId: string) {
    event.preventDefault()
    if (!draggingCardId) return
    const destination = currentBoard.columns.find((column) => column.id === destinationColumnId)
    if (!destination) return

    const sourceColumn = currentBoard.columns.find((column) =>
      column.cards.some((card) => card.id === draggingCardId))
    const sourceColumnIndex = currentBoard.columns.findIndex((column) => column.id === sourceColumn?.id)
    const destinationColumnIndex = currentBoard.columns.findIndex((column) => column.id === destinationColumnId)
    if (sourceColumnIndex < 0 || Math.abs(sourceColumnIndex - destinationColumnIndex) > 1) return
    const position = sourceColumn?.id === destinationColumnId
      ? destination.cards.length - 1
      : destination.cards.length
    void moveCard(draggingCardId, destinationColumnId, position)
  }

  return (
    <Stack gap={6}>
      <Confetti particleCount={confettiCount} />
      {!isReady && !error && <Text role="status">Loading board...</Text>}
      {error && <Alert.Root status="error"><Alert.Indicator /><Alert.Description>{error}</Alert.Description></Alert.Root>}
      <Heading as="h1" size="2xl">{currentBoard.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {currentBoard.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            canMoveCards={isReady && !movingCardId && !updatingCardId}
            movingCardId={movingCardId}
            users={users}
            isUpdating={updatingCardId !== null}
            onUpdateCard={updateCard}
            draggingCardId={draggingCardId}
            onCardKeyDown={handleKeyDown}
            onCardDragStart={setDraggingCardId}
            onCardDragEnd={() => setDraggingCardId(null)}
            onCardDrop={handleCardDrop}
            onColumnDrop={handleColumnDrop}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
