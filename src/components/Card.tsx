import { Card as ChakraCard, Text } from '@chakra-ui/react'
import { motion } from 'motion/react'
import type { Card as CardData } from '../types/board'

type CardProps = {
  card: CardData
  onDragStart: (card: CardData) => void
  onDragMove: (card: CardData, point: { x: number; y: number }) => void
  onDragEnd: (card: CardData, point: { x: number; y: number }) => void
}

export function Card({ card, onDragStart, onDragMove, onDragEnd }: CardProps) {
  return (
    <motion.div
      layout
      layoutId={card.id}
      drag
      dragSnapToOrigin
      whileDrag={{ scale: 1.03, boxShadow: 'lg', cursor: 'grabbing', zIndex: 10, pointerEvents: 'none' }}
      onDragStart={() => onDragStart(card)}
      onDrag={(_, info) => onDragMove(card, info.point)}
      onDragEnd={(_, info) => onDragEnd(card, info.point)}
      style={{ cursor: 'grab', touchAction: 'none' }}
      data-card-id={card.id}
    >
      <ChakraCard.Root size="sm">
        <ChakraCard.Body>
          <ChakraCard.Title>{card.title}</ChakraCard.Title>
          {card.description ? (
            <Text color="gray.600" fontSize="sm">
              {card.description}
            </Text>
          ) : null}
        </ChakraCard.Body>
      </ChakraCard.Root>
    </motion.div>
  )
}
