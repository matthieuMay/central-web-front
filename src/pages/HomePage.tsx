import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

export function HomePage() {
  return (
    <Stack gap={4} maxW="3xl" mx="auto">
      <Heading as="h1">Bienvenue sur Mini-Trello</Heading>
      <Text>Retrouvez vos tâches dans un tableau partagé.</Text>
      <Link asChild color="var(--link-color)" width="fit-content">
        <RouterLink to="/board">Ouvrir le tableau</RouterLink>
      </Link>
    </Stack>
  )
}
