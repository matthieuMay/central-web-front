import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useEffect, useLayoutEffect, useRef, useState, type DragEvent } from 'react'
import type { BoardData, UserData } from '../types/board'
import { Column } from './Column'
import { getDropMovement, getKeyboardMovement, type CardDirection, type CardMovement, type DropAnchor } from '../board-movement'

type BoardProps = { board: BoardData; blocked: boolean; onMoveCard: (intent: CardMovement) => Promise<void>;
  users: UserData[]; onOpenCard: (cardId: string) => void }
export type DropTarget = { intent: CardMovement; anchor?: DropAnchor }

export function Board({ board, blocked, onMoveCard, users, onOpenCard }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const focusRequest = useRef<{ cardId: string; original: Element } | null>(null)
  const draggedCard = useRef<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  function clearDrag() {
    draggedCard.current = null
    setDropTarget(null)
  }

  useEffect(() => {
    function onFocus(event: FocusEvent) {
      if (focusRequest.current && event.target !== focusRequest.current.original) focusRequest.current = null
    }
    document.addEventListener('focusin', onFocus)
    return () => { document.removeEventListener('focusin', onFocus); draggedCard.current = null }
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
    if (blocked || draggedCard.current || selectedCardId !== cardId || !(document.activeElement instanceof HTMLElement) ||
      document.activeElement.dataset.cardId !== cardId) return
    const intent = getKeyboardMovement(board, cardId, direction)
    if (!intent) return
    focusRequest.current = { cardId, original: document.activeElement }
    await onMoveCard(intent)
  }

  function startDrag(event: DragEvent, cardId: string) {
    if (blocked || !board.columns.some(column => column.cards.some(card => card.id === cardId))) {
      event.preventDefault()
      return
    }
    // Sprint 2's native payload; only a drag started from this confirmed board is accepted.
    event.dataTransfer.setData('text/plain', cardId)
    event.dataTransfer.effectAllowed = 'move'
    draggedCard.current = cardId
    setDropTarget(null)
  }

  function targetAt(event: DragEvent, columnId: string): DropTarget | undefined {
    if (blocked || !draggedCard.current) return
    const element = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-card-id]') : null
    let anchor: DropAnchor | undefined
    if (element && event.currentTarget.contains(element) && element.dataset.cardId) {
      const rect = element.getBoundingClientRect()
      anchor = { cardId: element.dataset.cardId, side: event.clientY < rect.top + rect.height / 2 ? 'before' : 'after' }
    }
    const intent = getDropMovement(board, draggedCard.current, columnId, anchor)
    return intent ? { intent, anchor } : undefined
  }

  function dragOver(event: DragEvent, columnId: string) {
    const target = targetAt(event, columnId)
    event.dataTransfer.dropEffect = target ? 'move' : 'none'
    if (target) event.preventDefault()
    setDropTarget(target ?? null)
  }

  function drop(event: DragEvent, columnId: string) {
    event.preventDefault()
    const target = targetAt(event, columnId)
    const cardId = event.dataTransfer.getData('text/plain')
    clearDrag()
    if (!target || target.intent.cardId !== cardId) return
    setSelectedCardId(cardId)
    // Preserve focus ownership: a drag does not take it from another command.
    if (document.activeElement instanceof HTMLElement && document.activeElement.dataset.cardId === cardId) {
      focusRequest.current = { cardId, original: document.activeElement }
    }
    void onMoveCard(target.intent)
  }

  return (
    <Stack ref={root} tabIndex={-1} aria-label={board.title} aria-describedby="board-instructions" gap={6} onDragEnd={clearDrag}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId}
            onSelectCard={selectCard} onDeselectCard={() => { clearDrag(); setSelectedCardId(null) }} onMoveCard={moveSelectedCard}
            blocked={blocked} dropTarget={blocked ? null : dropTarget} users={users} onOpenCard={onOpenCard}
            onDragStart={startDrag} onDragOver={dragOver} onDrop={drop}
            onDragLeave={() => setDropTarget(current => current?.intent.columnId === column.id ? null : current)} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
