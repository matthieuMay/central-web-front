import { Box, Button, Field, Heading, HStack, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import type { User } from '../types/board'

type CardMembersProps = {
  assigneeIds: string[] // ids of the Users assigned to the Card
  users: User[] // every User from GET /users
  isSaving: boolean
  // Receives the NEW full list of assignee ids. Resolves to true once it is saved,
  // false if the API refused it.
  onChange: (assigneeIds: string[]) => Promise<boolean>
}

/*
 * CardMembers — who works on this Card.
 *
 * Responsibility:
 *   - Shows the assigned members by name (firstname lastname), found in `users`.
 *   - Lets the user add a member chosen among the Users NOT yet assigned.
 *   - Lets the user remove one member.
 *
 * Action: calls onChange with the complete new list (existing ids + added one,
 * or existing ids minus removed one). It does not call the API itself.
 * It resets the person picker only when onChange resolves to true; on false the
 * choice stays, so the user can retry.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Adding a member keeps the others; removing one keeps the others.
 *   - A User already assigned cannot be added twice (the API requires unique ids).
 *   - No members yet: show "No members" and the add control still works.
 *   - Controls are disabled while isSaving.
 *   - A refused add keeps the chosen person in the picker.
 */
export function CardMembers(props: CardMembersProps) {
  const [chosenId, setChosenId] = useState('')
  const available = props.users.filter((user) => !props.assigneeIds.includes(user.id))

  function nameOf(id: string) {
    const user = props.users.find((item) => item.id === id)
    return user ? `${user.firstname} ${user.lastname}` : 'Unknown person'
  }

  async function add(event: FormEvent) {
    event.preventDefault()
    if (!chosenId || props.assigneeIds.includes(chosenId)) return
    const saved = await props.onChange([...props.assigneeIds, chosenId])
    if (saved) setChosenId('')
  }

  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>Members</Heading>
      {props.assigneeIds.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" mb={2}>No members</Text>
      ) : (
        <Stack as="ul" gap={1} mb={2} listStyleType="none">
          {props.assigneeIds.map((id) => (
            <HStack as="li" key={id} justify="space-between">
              <Text fontSize="sm">{nameOf(id)}</Text>
              <Button size="xs" variant="outline" disabled={props.isSaving}
                aria-label={`Remove ${nameOf(id)}`}
                onClick={() => props.onChange(props.assigneeIds.filter((item) => item !== id))}>
                Remove
              </Button>
            </HStack>
          ))}
        </Stack>
      )}
      <form onSubmit={add}>
        <Field.Root>
          <Field.Label htmlFor="card-member-select">Add a member</Field.Label>
          <HStack w="full">
            <NativeSelect.Root size="sm" disabled={props.isSaving || available.length === 0}>
              <NativeSelect.Field id="card-member-select" value={chosenId} onChange={(event) => setChosenId(event.target.value)}>
                <option value="">Choose a person</option>
                {available.map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <Button type="submit" size="sm" disabled={props.isSaving || !chosenId}>Add</Button>
          </HStack>
        </Field.Root>
      </form>
    </Box>
  )
}
