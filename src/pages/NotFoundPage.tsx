import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

export function NotFoundPage() {
  return (
    <Stack gap={4} maxW="3xl" mx="auto">
      <Heading as="h1" size="4xl" className="board-title">Page introuvable</Heading>
      <Text>Cette adresse ne correspond à aucune page.</Text>
      <Link asChild color="blue.fg" width="fit-content">
        <RouterLink to="/">Retour à l’accueil</RouterLink>
      </Link>
    </Stack>
  )
}
