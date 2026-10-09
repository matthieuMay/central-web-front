import { Box, Checkbox, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { UserData } from '../types/user'

export type CardMembersProps = {
  assignees: string[]
  users: UserData[]
  disabled: boolean
  onChange: (userId: string, assigned: boolean) => Promise<void>
}

export function CardMembers({ assignees, users, disabled, onChange }: CardMembersProps) {
  const [error, setError] = useState('')
  const members = [
    ...users.map((user) => ({ id: user.id, name: `${user.firstname} ${user.lastname}` })),
    ...assignees.filter((id) => !users.some((user) => user.id === id)).map((id) => ({ id, name: `Utilisateur inconnu (${id})` })),
  ]
  async function change(userId: string, assigned: boolean) {
    setError('')
    try { await onChange(userId, assigned) } catch (failure) { setError(failure instanceof Error ? failure.message : 'Modification impossible.') }
  }
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm" mb={3}>Membres</Heading>
      {!users.length && <Text color="fg.muted" fontSize="sm">Aucun utilisateur disponible pour une assignation.</Text>}
      <Stack gap={2}>
        {members.map((member) => <Checkbox.Root key={member.id} checked={assignees.includes(member.id)} disabled={disabled} onCheckedChange={({ checked }) => void change(member.id, checked === true)}>
          {/* Rejected writes leave Root unchanged; resync Ark’s native input after every render. */}
            <Checkbox.HiddenInput ref={(input) => { if (input) input.checked = assignees.includes(member.id) }} /><Checkbox.Control /><Checkbox.Label overflowWrap="anywhere">{member.name}</Checkbox.Label>
        </Checkbox.Root>)}
      </Stack>
      {error && <Text role="alert" color="fg.error" fontSize="sm" mt={2}>{error}</Text>}
    </Box>
  )
}
