import { useQuery } from '@tanstack/react-query'
import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import { getUsers } from '../api/board'
import { useUpdateCardCollections } from '../api/mutations'
import type { CardData } from '../types/board'
import { userDisplayName } from '../session/SessionContext'

type MemberProps = { card: CardData }

export function Member({ card }: MemberProps) {
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const update = useUpdateCardCollections()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)

  function change(userId: string) {
    setError('')
    const assignees = card.assignees.includes(userId) ? card.assignees.filter((id) => id !== userId) : [...card.assignees, userId]
    update.mutate({ cardId: card.id, collections: { assignees, comments: card.comments, subtasks: card.subtasks } }, {
      onError: (failure) => setError(`Could not update members: ${failure.message}. Try again.`),
    })
  }

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function stop(event: MouseEvent<HTMLElement>) {
    event.stopPropagation()
  }

  const selected = card.assignees.map((id) => users.data?.find((user) => user.id === id) ?? { id, name: id })
  const hiddenCount = Math.max(0, selected.length - 3)

  function listKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') close()
  }

  return (
    <Box mt={3} position="relative" maxW="100%" onClick={stop} onMouseDown={stop}>
      <HStack gap={1} flexWrap="wrap" aria-label={`Members assigned to ${card.title}`}>
        {selected.slice(0, 3).map((user) => <Box key={user.id} title={userDisplayName(user)} aria-label={userDisplayName(user)} borderRadius="full" bg="colorPalette.muted" px={2} py={1} fontSize="xs">{userDisplayName(user).slice(0, 1).toUpperCase()}</Box>)}
        {hiddenCount > 0 && <Button type="button" size="xs" variant="outline" aria-label={`Show ${hiddenCount} more assigned member${hiddenCount === 1 ? '' : 's'}`} onClick={() => setOpen(true)}>+{hiddenCount}</Button>}
        <Button ref={triggerRef} type="button" size="xs" variant="outline" aria-expanded={open} aria-controls={`member-list-${card.id}`} onClick={() => setOpen((value) => !value)}>Add member</Button>
      </HStack>
      {open && (
        <Stack id={`member-list-${card.id}`} role="listbox" aria-label="Choose members" gap={1} mt={2} p={2} borderWidth="1px" bg="bg" maxW="100%" onKeyDown={listKeyDown}>
          {users.isPending && <Text role="status">Loading users…</Text>}
          {users.isError && <Text role="alert">Could not load users: {users.error.message}</Text>}
          {users.data?.map((user) => <Button key={user.id} type="button" size="sm" variant={card.assignees.includes(user.id) ? 'solid' : 'outline'} role="option" aria-selected={card.assignees.includes(user.id)} disabled={update.isPending} onClick={() => change(user.id)}>{card.assignees.includes(user.id) ? 'Remove ' : 'Add '}{userDisplayName(user)}</Button>)}
          <Button type="button" size="sm" variant="ghost" onClick={close}>Close</Button>
          {update.isPending && <Text role="status">Saving members…</Text>}
          {error && <Text role="alert" color="red.700">{error}</Text>}
        </Stack>
      )}
      {users.data && selected.some((user) => !users.data?.some((available) => available.id === user.id)) && <Text role="alert" color="red.700">Some assigned members are not available in the user list.</Text>}
    </Box>
  )
}