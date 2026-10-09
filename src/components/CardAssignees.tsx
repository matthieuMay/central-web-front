import { Checkbox, Stack, Text } from '@chakra-ui/react'
import type { User } from '../types/board'

/**
 * CardAssignees — the Membres section of a Card Detail.
 *
 * Responsibility: show the Card's Assignees and let the user associate or
 * remove a User from the set the API offers.
 * Props: { assignees: string[]; users: User[]; disabled?: boolean;
 *   onChange: (next: string[]) => void }.
 * Events: emits the full next assignee array (associate appends, remove
 *   filters); CardDetail routes it through usePatchCard.
 * Data owner: none — the board query owns `assignees`; this component renders
 *   the slice and reports the intended whole array.
 * Correct when: associating appends the chosen User's id exactly once,
 *   removing drops only that id, and the emitted array is sent as-is.
 */
type CardAssigneesProps = {
  assignees: string[]
  users: User[]
  disabled?: boolean
  onChange: (next: string[]) => void
}

export function CardAssignees({ assignees, users, disabled, onChange }: CardAssigneesProps) {
  if (disabled) {
    return <Text color="fg.muted" fontSize="sm">Les membres sont indisponibles.</Text>
  }
  if (users.length === 0) {
    return <Text color="fg.muted" fontSize="sm">Aucune personne disponible.</Text>
  }

  return (
    <Stack gap={2}>
      {users.map((user) => {
        const checked = assignees.includes(user.id)
        return (
          <Checkbox.Root
            key={user.id}
            checked={checked}
            onCheckedChange={() =>
              onChange(checked ? assignees.filter((id) => id !== user.id) : [...assignees, user.id])
            }
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>{user.firstname} {user.lastname}</Checkbox.Label>
          </Checkbox.Root>
        )
      })}
    </Stack>
  )
}
