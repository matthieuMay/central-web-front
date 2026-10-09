import { Box, Button, Stack, Text } from '@chakra-ui/react'
import type { UserData } from '../types/board'

type CardMembersProps = {
  assignees: string[];
  availableUsers: UserData[];
  disabled?: boolean;
  onAssign: (user: string) => Promise<boolean>;
  onRemove: (user: string) => Promise<boolean>;
};

export function CardMembers({ assignees, availableUsers, disabled = false, onAssign, onRemove }: CardMembersProps) {
  const availableIds = new Set(availableUsers.map((user) => user.id))

  return (
    <Stack gap={1}>
      {availableUsers.length === 0 && <Text color="var(--app-muted-text)" fontSize="sm">No members available</Text>}
      {availableUsers.map((user) => {
        const isAssigned = assignees.includes(user.id)
        return (
          <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={isAssigned}
              disabled={disabled}
              onChange={() => { void (isAssigned ? onRemove(user.id) : onAssign(user.id)) }}
            />
            {user.firstname} {user.lastname}
          </label>
        )
      })}
      {assignees.filter((id) => !availableIds.has(id)).map((id) => (
        <Box key={id} display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Text color="var(--app-muted-text)" fontSize="sm">Unavailable member</Text>
          <Button size="xs" disabled={disabled} onClick={() => { void onRemove(id) }}>
            Remove
          </Button>
        </Box>
      ))}
    </Stack>
  )
}