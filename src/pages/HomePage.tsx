import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { setCurrentMemberId, useCurrentMemberId } from '../collab/storage'
import { members } from '../data/members'

export function HomePage() {
  const currentMemberId = useCurrentMemberId()
  return (
    <Stack gap={4} maxW="3xl" mx="auto">
      <Heading as="h1">Bienvenue sur Mini-Trello</Heading>
      <Text>Retrouvez vos tâches dans un tableau partagé.</Text>
      <Box as="fieldset" borderWidth="1px" borderColor="border" borderRadius="md" p={4} bg="bg">
        <Heading as="legend" size="md" px={1}>Qui êtes-vous ?</Heading>
        <Stack gap={2} mt={2}>
          {members.map((member) => (
            <label key={member.id}>
              <input type="radio" name="current-member" checked={currentMemberId === member.id} onChange={() => setCurrentMemberId(member.id)} />
              {' '}<Text as="span" fontWeight="semibold" color={`${member.color}.fg`}>{member.firstName} {member.lastName}</Text>
            </label>
          ))}
        </Stack>
      </Box>
      <Link asChild color="blue.fg" width="fit-content">
        <RouterLink to="/board">Ouvrir le tableau</RouterLink>
      </Link>
    </Stack>
  )
}
