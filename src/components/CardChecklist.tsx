import { Box, Heading, Text } from '@chakra-ui/react'
import type { CardChecklistItem } from '../types/board'

export type CardChecklistProps = {
  items: CardChecklistItem[]
  disabled: boolean
  onAdd: (description: string) => Promise<void>
  onSetDone: (index: number, item: CardChecklistItem, done: boolean) => Promise<void>
}

// Responsabilité : saisir une tâche et émettre l'état coché/décoché d'une occurrence.
// À vérifier : texte vide, descriptions identiques, index obsolète, ajouts et échec.
// Sans ID API, cibler par index et valeur au clic ; le parent conserve les autres items.
export function CardChecklist({ items }: CardChecklistProps) {
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm">Tâches à cocher</Heading>
      <Text color="fg.muted" fontSize="sm">Rendu temporaire SDD · {items.length} tâche(s)</Text>
    </Box>
  )
}
