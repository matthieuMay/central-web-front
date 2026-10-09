import { Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMoveCard } from '../api/mutations'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const moveMutation = useMoveCard()

  const selectedInfo = useMemo(() => {
    if (!selectedCardId) return null
    for (let i = 0; i < board.columns.length; i++) {
      const col = board.columns[i]
      const card = col.cards.find((c) => c.id === selectedCardId)
      if (card) {
        return { card, columnIndex: i, column: col }
      }
    }
    return null
  }, [board.columns, selectedCardId])

  const canMoveLeft = selectedInfo !== null && selectedInfo.columnIndex > 0
  const canMoveRight = selectedInfo !== null && selectedInfo.columnIndex < board.columns.length - 1

  const handleMoveLeft = useCallback((cardId?: string) => {
    const id = cardId ?? selectedCardId
    if (!id || moveMutation.isPending) return
    for (let i = 0; i < board.columns.length; i++) {
      const col = board.columns[i]
      if (col.cards.some((c) => c.id === id)) {
        if (i > 0) {
          const prevCol = board.columns[i - 1]
          moveMutation.mutate({ cardId: id, columnId: prevCol.id })
        }
        return
      }
    }
  }, [board.columns, selectedCardId, moveMutation])

  const handleMoveRight = useCallback((cardId?: string) => {
    const id = cardId ?? selectedCardId
    if (!id || moveMutation.isPending) return
    for (let i = 0; i < board.columns.length; i++) {
      const col = board.columns[i]
      if (col.cards.some((c) => c.id === id)) {
        if (i < board.columns.length - 1) {
          const nextCol = board.columns[i + 1]
          moveMutation.mutate({ cardId: id, columnId: nextCol.id })
        }
        return
      }
    }
  }, [board.columns, selectedCardId, moveMutation])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!selectedCardId || moveMutation.isPending) return

      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        if (canMoveLeft) {
          event.preventDefault()
          handleMoveLeft()
        }
      } else if (event.key === 'ArrowRight') {
        if (canMoveRight) {
          event.preventDefault()
          handleMoveRight()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCardId, canMoveLeft, canMoveRight, moveMutation.isPending, handleMoveLeft, handleMoveRight])

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <Heading as="h1" size="2xl">{board.title}</Heading>
        {selectedInfo && (
          <Flex
            align="center"
            gap={3}
            p={2}
            px={3}
            bg="blue.50"
            borderWidth="1px"
            borderColor="blue.300"
            borderRadius="md"
            wrap="wrap"
          >
            <Text fontSize="sm" color="blue.950">
              Carte sélectionnée : <strong>{selectedInfo.card.title}</strong>
            </Text>
            <Flex gap={2}>
              <button
                type="button"
                disabled={!canMoveLeft || moveMutation.isPending}
                onClick={() => handleMoveLeft()}
              >
                ← Déplacer à gauche
              </button>
              <button
                type="button"
                disabled={!canMoveRight || moveMutation.isPending}
                onClick={() => handleMoveRight()}
              >
                Déplacer à droite →
              </button>
            </Flex>
          </Flex>
        )}
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            columnIndex={index}
            totalColumns={board.columns.length}
            selectedCardId={selectedCardId}
            onSelectCard={setSelectedCardId}
            onMoveCardLeft={handleMoveLeft}
            onMoveCardRight={handleMoveRight}
            isMoving={moveMutation.isPending}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
