import { Box, Button, Flex, Menu, Portal, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useMoveCard, useUpdateCardCollections } from '../api/mutations'
import type { CardData, ColumnData, SubtaskData } from '../types/board'

type TaskProps = { card: CardData; columns: ColumnData[]; columnId: string }

function completionColumn(columns: ColumnData[]) {
  return columns.find((column) => /done|complete|treated|trait[eé]/i.test(column.title))
}

function SubtaskRow({ item, index, onReorder, onToggle, onDelete, disabled }: {
  item: SubtaskData
  index: number
  onReorder: (from: number, to: number) => void
  onToggle: (index: number, event: ChangeEvent<HTMLInputElement>) => void
  onDelete: (index: number) => void
  disabled: boolean
}) {
  const handleRef = useRef<HTMLButtonElement>(null)
  const [{ dragging }, drag] = useDrag(() => ({
    type: 'subtask',
    item: { index },
    collect: (monitor) => ({ dragging: monitor.isDragging() }),
  }), [index])
  const [, drop] = useDrop<{ index: number }>({
    accept: 'subtask',
    drop: (dragged) => { if (dragged.index !== index) onReorder(dragged.index, index) },
  }, [index, onReorder])
  useEffect(() => { drag(handleRef) }, [drag])
  const attachDrop = (node: HTMLDivElement | null) => { drop(node) }
  return (
    <Flex ref={attachDrop} align="center" gap={2} opacity={dragging ? 0.45 : 1} className={dragging ? 'subtask-dragging' : undefined}>
      <Button ref={handleRef} type="button" variant="ghost" size="xs" aria-label={`Reorder subtask ${item.title}`} disabled={disabled}>↕</Button>
      <input type="checkbox" aria-label={`Mark ${item.title} complete`} checked={item.done} disabled={disabled} onChange={(event) => onToggle(index, event)} onClick={(event) => event.stopPropagation()} />
      <Text flex="1" textDecoration={item.done ? 'line-through' : undefined}>{item.title}</Text>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button type="button" variant="ghost" size="xs" aria-label={`More actions for ${item.title}`} onClick={(event) => event.stopPropagation()}>⋮</Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content onClick={(event) => event.stopPropagation()}>
              <Menu.Item value="delete" onClick={() => onDelete(index)}>Delete</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  )
}

export function Task({ card, columns, columnId }: TaskProps) {
  const update = useUpdateCardCollections()
  const move = useMoveCard()
  const [writeError, setWriteError] = useState('')
  const [retrySubtasks, setRetrySubtasks] = useState<SubtaskData[] | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const moveRequested = useRef(false)
  const [moveFailed, setMoveFailed] = useState(false)
  const allComplete = card.subtasks.length > 0 && card.subtasks.every((item) => item.done)

  useEffect(() => {
    if (draft !== null) inputRef.current?.focus()
  }, [draft])

  useEffect(() => {
    if (!allComplete || update.isPending || move.isPending || moveRequested.current || moveFailed) return
    const destination = completionColumn(columns)
    if (!destination || destination.id === columnId) return
    moveRequested.current = true
    move.mutate({ cardId: card.id, column: destination.id, position: destination.cards.length }, {
      onError: (error) => {
        moveRequested.current = false
        setMoveFailed(true)
        setWriteError(`Subtasks saved, but the card could not be moved: ${error.message}. Try moving it again.`)
      },
    })
  }, [allComplete, card.id, columnId, columns, move, moveFailed, update.isPending])

  function persist(subtasks: SubtaskData[], onSuccess?: () => void) {
    setWriteError('')
    setRetrySubtasks(null)
    update.mutate({ cardId: card.id, collections: { assignees: card.assignees, comments: card.comments, subtasks } }, {
      onSuccess: () => { setRetrySubtasks(null); onSuccess?.() },
      onError: (error) => {
        setRetrySubtasks(subtasks)
        setWriteError(`Could not save subtasks: ${error.message}. Your changes remain available; try again.`)
      },
    })
  }

  function saveDraft() {
    const title = draft?.trim() ?? ''
    if (!title) { setWriteError('Subtask title cannot be blank.'); return }
    persist([...card.subtasks, { id: uuidv7(), title, done: false }], () => setDraft(null))
  }

  function toggle(index: number, event: ChangeEvent<HTMLInputElement>) {
    persist(card.subtasks.map((item, itemIndex) => itemIndex === index ? { ...item, done: event.target.checked } : item))
  }

  function reorder(from: number, to: number) {
    const subtasks = [...card.subtasks]
    const [item] = subtasks.splice(from, 1)
    subtasks.splice(to, 0, item)
    persist(subtasks)
  }

  function deleteSubtask(index: number) {
    if (!window.confirm(`Delete subtask "${card.subtasks[index].title}"?`)) return
    persist(card.subtasks.filter((_item, itemIndex) => itemIndex !== index))
  }

  function stop(event: MouseEvent<HTMLElement>) { event.stopPropagation() }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') { event.preventDefault(); saveDraft() }
    if (event.key === 'Escape') { event.preventDefault(); setDraft(null); setWriteError('') }
  }

  return (
    <Box mt={3} onClick={stop} onMouseDown={stop}>
      <Stack as="section" aria-label={`Subtasks for ${card.title}`} gap={1}>
        {card.subtasks.map((item, index) => <SubtaskRow key={item.id} item={item} index={index} onReorder={reorder} onToggle={toggle} onDelete={deleteSubtask} disabled={update.isPending || move.isPending} />)}
        {draft !== null && <Flex align="center" gap={2}>
          <input ref={inputRef} aria-label="New subtask title" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={keyDown} />
          <Button type="button" size="xs" onClick={saveDraft} disabled={update.isPending}>Save</Button>
          <Button type="button" size="xs" variant="ghost" onClick={() => setDraft(null)} disabled={update.isPending}>Cancel</Button>
        </Flex>}
        {!draft && <Button type="button" variant="ghost" size="sm" alignSelf="start" onClick={() => setDraft('')}>+ New task</Button>}
        {update.isPending && <Text role="status">Saving subtasks…</Text>}
        {retrySubtasks && <Button type="button" size="sm" alignSelf="start" onClick={() => persist(retrySubtasks)}>Retry saving subtasks</Button>}
        {move.isPending && <Text role="status">Moving completed card…</Text>}
        {writeError && <Text role="alert" color="red.700">{writeError}</Text>}
        {moveFailed && <Button type="button" size="sm" alignSelf="start" onClick={() => { setMoveFailed(false); setWriteError('') }}>Retry moving card</Button>}
      </Stack>
    </Box>
  )
}
