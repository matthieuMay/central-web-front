import { Box, Heading, Text } from '@chakra-ui/react'
import type { UserData } from '../types/user'

export type CardMembersProps = {
  assignees: string[]
  users: UserData[]
  disabled: boolean
  onChange: (userId: string, assigned: boolean) => Promise<void>
}

// Responsabilité : afficher les membres et émettre une association ou un retrait.
// À vérifier : liste vide, dernier retrait, doublons, ID inconnu, clavier et disabled.
// Le parent conserve la liste complète et prend en charge le PATCH et ses erreurs.
export function CardMembers({ assignees }: CardMembersProps) {
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm">Membres</Heading>
      <Text color="fg.muted" fontSize="sm">Rendu temporaire SDD · {assignees.length} membre(s)</Text>
    </Box>
  )
}
