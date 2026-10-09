import { useEffect, useState, type KeyboardEvent } from 'react'
import { Box, Heading, SimpleGrid, Spinner, Stack, Text } from '@chakra-ui/react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { columnOfCard, keyboardMove, type ArrowKey } from '../board/move'
import { useBoard, useMoveCard, useUsers } from '../board/useBoard'
import { CardDetail } from './CardDetail'
import { Column } from './Column'
import Confetti from './Confetti'

const ARROW_KEYS: ArrowKey[] = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

type BoardProps = { boardId?: string }

export function Board({ boardId = 'mini-trello' }: BoardProps) {
  const { data: board, isError, error } = useBoard(boardId)
  const users = useUsers()
  const moveCard = useMoveCard(boardId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [openCardId, setOpenCardId] = useState<string | null>(null)
  const [celebrations, setCelebrations] = useState(0)
  const [announcement, setAnnouncement] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  useEffect(() => {
    if (!selectedId || !board) return
    document.querySelector<HTMLElement>(`[data-card-id="${selectedId}"]`)?.focus()
  }, [board, selectedId])

  if (isError) {
    return <Text color="fg.error">Could not load the board: {(error as Error).message}</Text>
  }
  if (!board) {
    return <Spinner aria-label="Loading board" />
  }

  const boardData = board
  const finalColumnId = boardData.columns[boardData.columns.length - 1]?.id
  const openCard = openCardId
    ? boardData.columns.flatMap((column) => column.cards).find((card) => card.id === openCardId)
    : undefined

  function cardTitle(cardId: string) {
    for (const column of boardData.columns) {
      const card = column.cards.find((candidate) => candidate.id === cardId)
      if (card) return card.title
    }
    return ''
  }

  function columnTitle(columnId: string) {
    return boardData.columns.find((column) => column.id === columnId)?.title ?? ''
  }

  function performMove(cardId: string, column: string, position: number) {
    const source = columnOfCard(boardData, cardId)
    if (!source) return

    const entersFinalColumn = column === finalColumnId && source.id !== finalColumnId
    const title = cardTitle(cardId)

    moveCard.mutate(
      { cardId, move: { column, position } },
      {
        onSuccess: () => {
          if (entersFinalColumn) {
            setCelebrations((count) => count + 1)
            setAnnouncement(`${title} completed!`)
          } else {
            setAnnouncement(`Moved ${title} to ${columnTitle(column)}`)
          }
        },
        onError: () => setAnnouncement(`Could not move ${title}`),
      },
    )
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const cardId = String(active.id)
    const source = columnOfCard(boardData, cardId)
    if (!source) return
    const sourceIndex = source.cards.findIndex((card) => card.id === cardId)

    const overId = String(over.id)
    const overColumn = boardData.columns.find((column) => column.id === overId)
    if (overColumn) {
      if (overColumn.id === source.id) {
        if (sourceIndex === overColumn.cards.length - 1) return
        performMove(cardId, overColumn.id, overColumn.cards.length - 1)
      } else {
        performMove(cardId, overColumn.id, overColumn.cards.length)
      }
      return
    }

    const target = columnOfCard(boardData, overId)
    if (!target) return
    const targetIndex = target.cards.findIndex((card) => card.id === overId)
    if (target.id === source.id && targetIndex === sourceIndex) return
    performMove(cardId, target.id, targetIndex)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      setSelectedId(null)
      return
    }
    if (!selectedId || !ARROW_KEYS.includes(event.key as ArrowKey)) return

    event.preventDefault()
    const move = keyboardMove(boardData, selectedId, event.key as ArrowKey)
    if (move) performMove(selectedId, move.column, move.position)
  }

  function handleSelect(cardId: string) {
    setSelectedId((current) => (current === cardId ? null : cardId))
  }

  return (
    <Box position="relative" onKeyDown={handleKeyDown} onClick={() => setSelectedId(null)}>
      <Stack gap={6}>
        <Heading as="h1" size="2xl">{boardData.title}</Heading>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
            {boardData.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                selectedId={selectedId}
                onSelect={handleSelect}
                onOpen={setOpenCardId}
              />
            ))}
          </SimpleGrid>
        </DndContext>
      </Stack>
      <Box position="absolute" top="50%" left="50%" pointerEvents="none" zIndex={10}>
        <Confetti particleCount={celebrations} />
      </Box>
      <Box
        role="status"
        aria-label="Board announcements"
        aria-live="polite"
        position="absolute"
        width="1px"
        height="1px"
        overflow="hidden"
        clipPath="inset(50%)"
      >
        {announcement}
      </Box>
      {openCard && (
        <CardDetail
          boardId={boardId}
          card={openCard}
          users={users.data ?? []}
          isUsersLoading={users.isLoading}
          isUsersError={users.isError}
          onClose={() => setOpenCardId(null)}
        />
      )}
    </Box>
  )
}
