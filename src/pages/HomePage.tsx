import { Button, Heading, Stack, Text } from '@chakra-ui/react'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Link as RouterLink } from 'react-router'

export function HomePage() {
  return (
    <Stack gap={5} maxW="2xl" mx="auto" py={{ base: 6, md: 12 }} align="start">
      <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} letterSpacing="-0.03em" fontWeight="600">Bienvenue sur Mini-Trello</Heading>
      <Text color="fg.muted">Retrouvez vos tâches dans un tableau partagé.</Text>
      <Button asChild colorPalette="blue" mt={2}>
        <RouterLink to="/board">Ouvrir le tableau<ArrowRightIcon aria-hidden="true" /></RouterLink>
      </Button>
    </Stack>
  )
}
