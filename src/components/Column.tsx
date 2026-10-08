import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import { Card } from './Card'
import type { DropTarget } from './Board'
import type { Card as CardData, Column as ColumnData } from '../types/board'

type ColumnProps = {
  column: ColumnData
  dropTarget: DropTarget | null
  onDragStart: (card: CardData) => void
  onDragMove: (card: CardData, point: { x: number; y: number }) => void
  onDragEnd: (card: CardData, point: { x: number; y: number }) => void
}

function Placeholder() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.6 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0.6 }}
      transition={{ duration: 0.12 }}
      style={{ height: 48, transformOrigin: 'center' }}
    >
      <Box
        height="48px"
        borderRadius="md"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="blue.400"
        bg="blue.50"
      />
    </motion.div>
  )
}

export function Column({
  column,
  dropTarget,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ColumnProps) {
  const isTarget = dropTarget?.columnId === column.id
  const insertIndex = isTarget ? dropTarget.index : -1

  return (
    <Stack
      gap={3}
      bg={isTarget ? 'blue.50' : 'gray.100'}
      borderRadius="md"
      p={4}
      minW="0"
      data-column-id={column.id}
      transition="background-color 0.15s ease"
    >
      <Heading as="h2" size="md">
        {column.title}
      </Heading>
      {column.cards.length === 0 && !isTarget ? (
        <Text color="gray.500" fontSize="sm">
          Aucune carte
        </Text>
      ) : (
        <Stack gap={3}>
          <AnimatePresence initial={false}>
            {column.cards.map((card, index) => (
              <Stack key={card.id} gap={3}>
                {insertIndex === index ? <Placeholder /> : null}
                <Card
                  card={card}
                  onDragStart={(dragged) => onDragStart(dragged)}
                  onDragMove={(dragged, point) => onDragMove(dragged, point)}
                  onDragEnd={(dropped, point) => onDragEnd(dropped, point)}
                />
              </Stack>
            ))}
            {insertIndex === column.cards.length ? <Placeholder /> : null}
          </AnimatePresence>
        </Stack>
      )}
    </Stack>
  )
}
