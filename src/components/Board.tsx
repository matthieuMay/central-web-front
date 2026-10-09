import { Box, Button, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { LayoutGroup, MotionConfig } from 'motion/react'
import type { BoardData } from '../types/board'
import { useMoveCard } from '../api/mutations'
import { Column } from './Column'
import { useEffect, useState } from 'react'

type BoardProps = { board: BoardData }
export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const move = useMoveCard()
  const selectedColumnIndex = board.columns.findIndex(column =>
    column.cards.some(card => card.id === selectedCardId)
  )

  useEffect(() => {
    if (selectedCardId) document.getElementById(`card-${selectedCardId}`)?.focus({ preventScroll: true })
  }, [selectedCardId, selectedColumnIndex])

  function selectedCard(id: string) {
    if (move.isPending) return
    move.reset()
    setSelectedCardId(current => current === id ? null : id)
  }

  function moveSelected(direction: -1 | 1) {
    if (!selectedCardId || move.isPending) return
    if (selectedColumnIndex === -1) return
    const destination = board.columns[selectedColumnIndex + direction]
    if (!destination) return
    move.mutate({ cardId: selectedCardId, columnId: destination.id })
  }
  return (
    <Stack
      gap={6}
      onKeyDown={(event) => {
        const target = event.target
        if (
          target instanceof HTMLElement &&
          target.closest('input, textarea, select, [contenteditable]')
        ) return
        if (!selectedCardId) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          moveSelected(-1)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          moveSelected(1)
        }
      }}
    >
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={4}>
        <Flex gap={3} justify="space-between" align="center" wrap="wrap">
          <Text role="status" fontSize="sm" color="gray.600" minH="2.5rem" flex="1" minW="12rem">
            {move.isPending ? 'Déplacement en cours…' : selectedCardId
              ? 'Carte sélectionnée · utilisez aussi les flèches du clavier'
              : 'Sélectionnez une carte pour la déplacer'}
          </Text>
          <Flex gap={2}>
            <Button type="button" aria-label="Déplacer à gauche" size="sm" variant="outline" colorPalette="blue" disabled={move.isPending || selectedColumnIndex <= 0} onClick={() => moveSelected(-1)}>
              <span aria-hidden="true">←</span> Gauche
            </Button>
            <Button type="button" aria-label="Déplacer à droite" size="sm" variant="outline" colorPalette="blue" disabled={move.isPending || selectedColumnIndex === -1 || selectedColumnIndex >= board.columns.length - 1} onClick={() => moveSelected(1)}>
              Droite <span aria-hidden="true">→</span>
            </Button>
          </Flex>
        </Flex>
        <Text role={move.isError ? 'alert' : undefined} minH="1.25rem" mt={2} fontSize="sm" color="red.600">
          {move.isError && 'Déplacement non confirmé. Vérifiez le tableau puis réessayez.'}
        </Text>
      </Box>
      <MotionConfig reducedMotion="user" transition={{ layout: { duration: 0.22, ease: [0.77, 0, 0.175, 1] } }}>
        <LayoutGroup id={board.id}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
            {board.columns.map((column) => (
              <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectedCard={selectedCard} />
            ))}
          </SimpleGrid>
        </LayoutGroup>
      </MotionConfig>
    </Stack>
  )
}
