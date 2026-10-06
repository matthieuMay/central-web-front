import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

export function NotFoundPage() {
  return (
    <Stack gap={4}>
      <Heading as="h1">Page introuvable</Heading>
      <Text>Cette adresse ne correspond à aucune page.</Text>
      <Link asChild color="blue.700" width="fit-content">
        <RouterLink to="/">Retour à l’accueil</RouterLink>
      </Link>
    </Stack>
  )
}
