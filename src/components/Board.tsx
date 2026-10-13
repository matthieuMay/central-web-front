import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { BoardData } from '../types/board'
import { Column } from './Column'
import { getKeyboardMovement, type CardDirection } from '../board-movement'

type BoardProps = { board: BoardData; blocked: boolean; onMoveCard: (cardId: string, direction: CardDirection) => Promise<void> }

export function Board({ board, blocked, onMoveCard }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const focusRequest = useRef<{ cardId: string; original: Element } | null>(null)

  useEffect(() => {
    function onFocus(event: FocusEvent) {
      if (focusRequest.current && event.target !== focusRequest.current.original) focusRequest.current = null
    }
    document.addEventListener('focusin', onFocus)
    return () => { document.removeEventListener('focusin', onFocus) }
  }, [])

  useLayoutEffect(() => {
    const cards = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-card-id]') ?? [])
    if (selectedCardId && !cards.some(card => card.dataset.cardId === selectedCardId)) setSelectedCardId(null)
    const request = focusRequest.current
    if (!request || blocked) return
    focusRequest.current = null
    const card = cards.find(card => card.dataset.cardId === request.cardId)
    const target = card ?? root.current
    target?.focus()
  }, [board, selectedCardId, blocked])

  function selectCard(cardId: string) {
    setSelectedCardId(current => current === cardId ? null : cardId)
  }

  async function moveSelectedCard(cardId: string, direction: CardDirection) {
    if (blocked || selectedCardId !== cardId || !(document.activeElement instanceof HTMLElement) ||
      document.activeElement.dataset.cardId !== cardId) return
    if (!getKeyboardMovement(board, cardId, direction)) return
    focusRequest.current = { cardId, original: document.activeElement }
    await onMoveCard(cardId, direction)
  }

  return (
    <Stack ref={root} tabIndex={-1} aria-label={board.title} aria-describedby="board-instructions" gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId}
            onSelectCard={selectCard} onDeselectCard={() => setSelectedCardId(null)} onMoveCard={moveSelectedCard} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
