import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

export function HomePage() {
  return (
    <Stack gap={4}>
      <Heading as="h1">Bienvenue sur Mini-Trello</Heading>
      <Text>Retrouvez vos tâches dans un tableau partagé.</Text>
      <Link asChild color="blue.700" width="fit-content">
        <RouterLink to="/board">Ouvrir le tableau</RouterLink>
      </Link>
    </Stack>
  )
}
