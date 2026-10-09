
import { useEffect, useRef, useState } from 'react'
import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { Column } from './Column'
import type { BoardData } from '../types/board'

type BoardProps = {
  board: BoardData
}

export function Board({ board }: BoardProps) {
  const [boardData, setBoardData] = useState<BoardData>(board)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const focusAfterMove = useRef(false)

  function selectCard(cardId: string) {
    setSelectedCardId((current) =>
      current === cardId ? null : cardId
    )
  }

  function moveCard(cardId: string, targetColumnId: string) {
    setBoardData((current) => {
      const sourceColumn = current.columns.find((column) =>
        column.cards.some((card) => card.id === cardId)
      )

      if (!sourceColumn || sourceColumn.id === targetColumnId) {
        return current
      }

      const card = sourceColumn.cards.find(
        (card) => card.id === cardId
      )

      if (!card) return current

      return {
        ...current,
        columns: current.columns.map((column) => {
          if (column.id === sourceColumn.id) {
            return {
              ...column,
              cards: column.cards.filter(
                (card) => card.id !== cardId
              ),
            }
          }

          if (column.id === targetColumnId) {
            return {
              ...column,
              cards: [...column.cards, card],
            }
          }

          return column
        }),
      }
    })
  }

  function moveSelectedCard(cardId: string, direction: -1 | 1) {
    const currentIndex = boardData.columns.findIndex((column) =>
      column.cards.some((card) => card.id === cardId)
    )

    if (currentIndex === -1) return

    const nextColumn = boardData.columns[currentIndex + direction]

    if (!nextColumn) return

    focusAfterMove.current = true
    moveCard(cardId, nextColumn.id)
  }

  useEffect(() => {
    if (!selectedCardId) return

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target

      // Ne pas intercepter les touches dans un champ
      // ou sur un élément interactif.
      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          target.closest(
            'input, textarea, select, button, [contenteditable="true"]'
          )
        )
      ) {
        return
      }

      if (event.key === 'Escape') {
        setSelectedCardId(null)
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        moveSelectedCard(selectedCardId!, -1)
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        moveSelectedCard(selectedCardId!, 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCardId, boardData])

  useEffect(() => {
    if (!focusAfterMove.current || !selectedCardId) return

    focusAfterMove.current = false

    const cards = document.querySelectorAll<HTMLElement>(
      '[data-card-id]'
    )

    const card = Array.from(cards).find(
      (element) => element.dataset.cardId === selectedCardId
    )

    card?.focus()
  }, [boardData, selectedCardId])

  return (
    <Stack gap={6} width="100%">
      <Heading size="2xl">{boardData.title}</Heading>

      <SimpleGrid
        columns={{ base: 1, md: 2, xl: 4 }}
        gap={4}
        width="100%"
      >
        {boardData.columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            onMoveCard={moveCard}
            selectedCardId={selectedCardId}
            onSelectCard={selectCard}
            onMoveSelectedCard={moveSelectedCard}
            canMoveLeft={index > 0}
            canMoveRight={index < boardData.columns.length - 1}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
