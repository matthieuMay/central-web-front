import { useEffect, useState } from 'react'
import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard } from '../api/mutations'
import { Board } from '../components/Board'
import type { BoardData } from '../types/board'

// Renvoie la position (0, 1, 2, 3) de la Colonne qui contient la Carte,
// ou -1 si la Carte n'est dans aucune Colonne.
function findColumnIndex(board: BoardData, cardId: string) {
  for (let index = 0; index < board.columns.length; index++) {
    for (const card of board.columns[index].cards) {
      if (card.id === cardId) {
        return index
      }
    }
  }
  return -1
}

export function BoardPage() {
  // État serveur : le Tableau, lu depuis l'API.
  const { data: board, isPending, isError, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  // État local : l'id de la Carte sélectionnée, ou null.
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  // La mutation qui envoie le PUT.
  const move = useMoveCard()

  function selectCard(cardId: string) {
    move.reset() // efface un éventuel ancien message d'erreur
    setSelectedCardId((current) => (current === cardId ? null : cardId))
  }

  // La même intention pour les boutons ET pour le clavier.
  function moveSelectedCard(direction: 'left' | 'right') {
    if (!board || !selectedCardId) return
    if (move.isPending) return // un déplacement est déjà en cours

    const currentIndex = findColumnIndex(board, selectedCardId)
    let targetIndex = currentIndex + 1
    if (direction === 'left') {
      targetIndex = currentIndex - 1
    }

    // Au bord du Tableau : aucune action.
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= board.columns.length) return

    const targetColumn = board.columns[targetIndex]
    move.mutate({ cardId: selectedCardId, columnId: targetColumn.id })
  }

  useEffect(() => {
    if (!selectedCardId) return

    function onKeyDown(event: KeyboardEvent) {
      const element = event.target as HTMLElement
      // Ne pas intercepter les flèches quand on écrit dans un champ ou qu'on est sur un bouton.
      if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') return

      if (event.key === 'ArrowLeft') moveSelectedCard('left')
      if (event.key === 'ArrowRight') moveSelectedCard('right')
      if (event.key === 'Escape') setSelectedCardId(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, moveSelectedCard])

  if (isPending) return <p role="status">Loading board…</p>
  if (isError) return <p role="alert">Could not load board: {error.message}</p>

  // Ici, board est chargé : on peut calculer où est la Carte sélectionnée.
  let selectedColumnIndex = -1
  if (selectedCardId) {
    selectedColumnIndex = findColumnIndex(board, selectedCardId)
  }
  const isFirstColumn = selectedColumnIndex === 0
  const isLastColumn = selectedColumnIndex === board.columns.length - 1

  return (
    <Stack gap={4}>
      <Stack minH="3rem" gap={2}>
        {selectedColumnIndex !== -1 && (
          <HStack gap={3}>
            <Button size="sm" onClick={() => moveSelectedCard('left')} disabled={isFirstColumn || move.isPending}>
              Move left
            </Button>
            <Button size="sm" onClick={() => moveSelectedCard('right')} disabled={isLastColumn || move.isPending}>
              Move right
            </Button>
            {move.isPending && <Text>Moving card…</Text>}
          </HStack>
        )}
        {move.isError && <Text role="alert" color="red.700">Could not move card: {move.error.message}</Text>}
      </Stack>
      <Board board={board} selectedCardId={selectedCardId} onSelectCard={selectCard} />
    </Stack>
  )
}