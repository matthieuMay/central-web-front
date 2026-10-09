import { Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useRef, useState } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import { updateCardPosition } from '../api/cards'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import Confetti from './Confetti'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [currentBoard, setCurrentBoard] = useState(board)
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<{ columnId: string; position: number } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [celebrationCount, setCelebrationCount] = useState(0)
  const moveInProgress = useRef(false)

  const moveCard = async (cardId: string, targetColumnId: string, position: number) => {
    if (moveInProgress.current) return

    const sourceColumn = currentBoard.columns.find((column) =>
      column.cards.some((card) => card.id === cardId),
    )
    const targetColumn = currentBoard.columns.find((column) => column.id === targetColumnId)
    if (!sourceColumn || !targetColumn) return

    const sourcePosition = sourceColumn.cards.findIndex((card) => card.id === cardId)
    const targetCards = targetColumn.cards.filter((card) => card.id !== cardId)
    if (!Number.isInteger(position) || position < 0 || position > targetCards.length) return
    if (sourceColumn.id === targetColumn.id && position === sourcePosition) return

    moveInProgress.current = true
    setIsMoving(true)
    setErrorMessage(null)

    try {
      const updatedBoard = await updateCardPosition(cardId, targetColumnId, position)
      setCurrentBoard(updatedBoard)
      if (
        sourceColumn.id !== targetColumn.id &&
        targetColumnId === currentBoard.columns.at(-1)?.id
      ) {
        setCelebrationCount((count) => count + 1)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not move card. Please try again.',
      )
    } finally {
      moveInProgress.current = false
      setIsMoving(false)
    }
  }

  const handleCardKeyDown = (cardId: string, event: KeyboardEvent<HTMLElement>) => {
    const columnIndex = currentBoard.columns.findIndex((column) =>
      column.cards.some((card) => card.id === cardId),
    )
    const sourceColumn = currentBoard.columns[columnIndex]
    if (!sourceColumn) return

    const cardIndex = sourceColumn.cards.findIndex((card) => card.id === cardId)
    let targetColumnIndex = columnIndex
    let targetPosition = cardIndex

    switch (event.key) {
      case 'ArrowUp':
        if (cardIndex === 0) return
        targetPosition -= 1
        break
      case 'ArrowDown':
        if (cardIndex === sourceColumn.cards.length - 1) return
        targetPosition += 1
        break
      case 'ArrowLeft':
        if (columnIndex === 0) return
        targetColumnIndex -= 1
        break
      case 'ArrowRight':
        if (columnIndex === currentBoard.columns.length - 1) return
        targetColumnIndex += 1
        break
      default:
        return
    }

    event.preventDefault()
    const targetColumn = currentBoard.columns[targetColumnIndex]
    if (!targetColumn) return
    if (targetColumn.id !== sourceColumn.id) {
      targetPosition = Math.min(cardIndex, targetColumn.cards.length)
    }
    void moveCard(cardId, targetColumn.id, targetPosition)
  }

  const handleCardDragStart = (cardId: string, event: DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', cardId)
    setDraggedCardId(cardId)
    setDropIndicator(null)
  }

  const handleCardDragEnd = () => {
    setDraggedCardId(null)
    setDropIndicator(null)
  }

  const handleCardDragOver = (
    columnId: string,
    cardId: string,
    event: DragEvent<HTMLElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const movingCardId = draggedCardId ?? event.dataTransfer.getData('text/plain')
    if (!movingCardId || movingCardId === cardId) return

    const column = currentBoard.columns.find((item) => item.id === columnId)
    if (!column) return
    const remainingCards = column.cards.filter((card) => card.id !== movingCardId)
    const targetIndex = remainingCards.findIndex((card) => card.id === cardId)
    if (targetIndex < 0) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY >= bounds.top + bounds.height / 2
    const position = targetIndex + Number(insertAfter)
    setDropIndicator((current) =>
      current?.columnId === columnId && current.position === position
        ? current
        : { columnId, position },
    )
  }

  const handleCardDrop = (
    columnId: string,
    cardId: string,
    event: DragEvent<HTMLElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const movingCardId = draggedCardId ?? event.dataTransfer.getData('text/plain')
    if (!movingCardId || movingCardId === cardId) return

    const column = currentBoard.columns.find((item) => item.id === columnId)
    if (!column) return
    const remainingCards = column.cards.filter((card) => card.id !== movingCardId)
    const targetIndex = remainingCards.findIndex((card) => card.id === cardId)
    if (targetIndex < 0) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY >= bounds.top + bounds.height / 2
    void moveCard(movingCardId, columnId, targetIndex + Number(insertAfter))
  }

  const handleColumnDragOver = (columnId: string, event: DragEvent<HTMLElement>) => {
    if (!draggedCardId) return
    event.preventDefault()
    const column = currentBoard.columns.find((item) => item.id === columnId)
    if (!column) return
    const position = column.cards.filter((card) => card.id !== draggedCardId).length
    setDropIndicator((current) =>
      current?.columnId === columnId && current.position === position
        ? current
        : { columnId, position },
    )
  }

  const handleColumnDrop = (columnId: string, event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    const movingCardId = draggedCardId ?? event.dataTransfer.getData('text/plain')
    if (!movingCardId) return
    const column = currentBoard.columns.find((item) => item.id === columnId)
    if (!column) return
    const position = column.cards.filter((card) => card.id !== movingCardId).length
    void moveCard(movingCardId, columnId, position)
  }

  return (
    <>
      <Confetti particleCount={celebrationCount} />
      <Stack gap={6}>
        <Heading as="h1" size="2xl">{currentBoard.title}</Heading>
        <Text color="var(--text-muted)" id="board-instructions">
          Focus a card to move it with the arrow keys, or drag it to a position in any column.
        </Text>
        {errorMessage && <Text role="alert" color="red.600">{errorMessage}</Text>}
        {isMoving && <Text role="status">Updating card position…</Text>}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
          {currentBoard.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              draggedCardId={draggedCardId}
              dropPosition={dropIndicator?.columnId === column.id ? dropIndicator.position : null}
              onCardFocus={() => setErrorMessage(null)}
              onCardKeyDown={handleCardKeyDown}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onCardDragOver={handleCardDragOver}
              onCardDrop={handleCardDrop}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </>
  )
}
