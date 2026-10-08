import { Card } from '@chakra-ui/react'
import type { CardData } from '../type.ts'

export default function BoardCard({ card }: { card: CardData }) {
  return (
    <Card.Root>
    <Card.Body>
      <Card.Title>{card.title}</Card.Title>
    <Card.Description>{card.description}</Card.Description>
    </Card.Body>
    <Card.Footer />
    </Card.Root>
  )
}