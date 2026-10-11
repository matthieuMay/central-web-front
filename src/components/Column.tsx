import { Box, Button, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard, useEditCard } from '../api/mutations'
import invaderIcon from '../public/invader.ico'
import type { ColumnData, User } from '../types/board'
import { AddCardPopup } from './AddCardPopup'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onComments: (id: string) => void
  users: User[]
  moving: boolean
  celebrationCardId: string | null
  celebrationToken: number
  onMoveCard: (cardId: string, columnId: string, position: number, sourceColumnId: string) => void
  onChecklistChange: (cardId: string, items: ColumnData['cards'][number]['checklistItems']) => void
  checklistDisabled: boolean
}

type DragItem = { cardId: string; sourceColumnId: string; sourcePosition: number }

function DropSlot({ columnId, position, moving, empty, onMoveCard }: {
  columnId: string
  position: number
  moving: boolean
  empty: boolean
  onMoveCard: ColumnProps['onMoveCard']
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    canDrop: (item: DragItem) => !moving && !(item.sourceColumnId === columnId && item.sourcePosition === position),
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return
      const targetPosition = item.sourceColumnId === columnId && item.sourcePosition < position ? position - 1 : position
      onMoveCard(item.cardId, columnId, targetPosition, item.sourceColumnId)
    },
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  }), [columnId, position, moving, onMoveCard])

  return (
    <Box
      ref={drop}
      aria-hidden
      minH={empty ? '4rem' : position === 0 ? '0.25rem' : '2.5rem'}
      mt={position === 0 && !empty ? -3 : undefined}
      display="flex"
      alignItems="center"
      justifyContent="center"
      data-drop-position={position}
    >
      <Box
        aria-hidden
        width="100%"
        height={position === 0 && !empty ? '0' : '0.75rem'}
        borderRadius="sm"
        bg={isOver && canDrop ? 'blue.500' : 'transparent'}
        transition="background-color 120ms ease"
      />
    </Box>
  )
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, onComments, users, moving, celebrationCardId, celebrationToken, onMoveCard, onChecklistChange, checklistDisabled }: ColumnProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [popupOpen, setPopupOpen] = useState(false)
  const [operationError, setOperationError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const create = useCreateCard()
  const edit = useEditCard()
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    canDrop: () => !moving,
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return
      const position = item.sourceColumnId === column.id ? Math.max(0, column.cards.length - 1) : column.cards.length
      onMoveCard(item.cardId, column.id, position, item.sourceColumnId)
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [column.id, column.cards.length, moving, onMoveCard])

  useEffect(() => {
    if (!successMessage) return
    const timeout = window.setTimeout(() => setSuccessMessage(''), prefersReducedMotion ? 3000 : 3350)
    return () => window.clearTimeout(timeout)
  }, [prefersReducedMotion, successMessage])

  function openPopup() {
    create.reset()
    edit.reset()
    setTitle('')
    setDescription('')
    setOperationError(null)
    setPopupOpen(true)
  }

  function closePopup() {
    setPopupOpen(false)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || create.isPending) return
    const id = uuidv7()
    const trimmedDescription = description.trim()
    setOperationError(null)
    create.mutate({ columnId: column.id, id, title: trimmed }, {
      onSuccess: () => {
        if (!trimmedDescription) {
          setPopupOpen(false)
          setSuccessMessage(`Card successfully created in ${column.title}`)
          return
        }
        edit.mutate({ cardId: id, description: trimmedDescription }, {
          onSuccess: () => {
            setPopupOpen(false)
            setSuccessMessage(`Card successfully created in ${column.title}`)
          },
          onError: (error) => {
            setPopupOpen(false)
            setOperationError(`Card added, but its description could not be saved: ${error.message}`)
          },
        })
      },
      onError: (error) => {
        setOperationError(`Could not add card: ${error.message}`)
      },
    })
  }

  return (
    <Box ref={drop} as="section" aria-label={column.title} bg={isOver ? 'bg.info' : 'bg.muted'} borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="lg" mb={column.cards.length ? 0 : 4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        <DropSlot columnId={column.id} position={0} moving={moving} empty={column.cards.length === 0} onMoveCard={onMoveCard} />
        {column.cards.map((card, index) => (
          <div key={card.id}>
            <Card
              columnId={column.id}
              position={index}
              card={card}
              selected={card.id === selectedCardId}
              disabled={moving}
              celebrationToken={card.id === celebrationCardId ? celebrationToken : null}
              onSelect={() => onSelectCard(card.id)}
              onEdit={() => onEditCard(card.id)}
              onComments={() => onComments(card.id)}
              users={users}
              onChecklistChange={(items) => onChecklistChange(card.id, items)}
              checklistDisabled={checklistDisabled}
            />
            <DropSlot columnId={column.id} position={index + 1} moving={moving} empty={false} onMoveCard={onMoveCard} />
          </div>
        ))}
        <Button
          ref={triggerRef}
          type="button"
          bg="blue.100"
          color="blue.800"
          _hover={{ bg: 'blue.200' }}
          _dark={{ bg: 'blue.800', color: 'blue.100', _hover: { bg: 'blue.700' } }}
          alignSelf="flex-end"
          width="fit-content"
          onClick={openPopup}
          aria-haspopup="dialog"
        >
          <Text as="span" fontSize="lg" lineHeight="1" aria-hidden>+</Text>
          <Text as="span">Add a card</Text>
        </Button>
        {operationError && <Text role="alert" color="red.700">{operationError}</Text>}
        <AddCardPopup
          open={popupOpen}
          columnTitle={column.title}
          title={title}
          description={description}
          pending={create.isPending || edit.isPending}
          error={operationError}
          triggerRef={triggerRef}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSubmit={submit}
          onClose={closePopup}
        />
        <AnimatePresence>
          {successMessage && (
            <motion.div
              role="status"
              initial={{ x: 'calc(100% + 1rem)', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 'calc(100% + 1rem)', opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
              style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1600 }}
            >
              <Box display="flex" alignItems="center" gap={3} bg="blue.subtle" color="blue.fg" px={4} py={3} borderRadius="md" boxShadow="md">
                <Image src={invaderIcon} alt="" aria-hidden width="2rem" height="2rem" objectFit="contain" />
                <Text>{successMessage}</Text>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </Box>
  )
}
