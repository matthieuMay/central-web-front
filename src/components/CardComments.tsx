import { Box, Heading, Text } from '@chakra-ui/react'
import type { CardComment, NewCardComment } from '../types/board'
import type { UserData } from '../types/user'

export type CardCommentsProps = {
  comments: CardComment[]
  users: UserData[]
  disabled: boolean
  onPublish: (comment: NewCardComment) => Promise<void>
}

// Responsabilité : lire l'activité et saisir un commentaire avec un auteur choisi.
// À vérifier : auteur absent, texte vide, dates conservées, ajouts successifs et échec.
// Émettre seulement le nouveau commentaire sans date ; garder le brouillon si échec.
export function CardComments({ comments }: CardCommentsProps) {
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm">Commentaires</Heading>
      <Text color="fg.muted" fontSize="sm">Rendu temporaire SDD · {comments.length} commentaire(s)</Text>
    </Box>
  )
}
