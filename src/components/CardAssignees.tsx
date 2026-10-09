import { Box, Button, Input, Stack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import type { User } from '../types/board'

export type CardAssigneesProps = {
  assigneeIds: string[]
  users: User[]
  variant?: 'compact' | 'editor'
  disabled?: boolean
  loading?: boolean
  error?: string | null
  errorType?: 'load' | 'update'
  showLabel?: boolean
  onChange?: (assigneeIds: string[]) => void
  onOpenDetails?: () => void
}

function initials(user: User) {
  const first = user.firstname.trim().charAt(0).toUpperCase()
  const last = user.lastname.trim().charAt(0).toUpperCase()
  return `${first}${last}` || '?'
}

function userName(user: User) {
  return `${user.firstname} ${user.lastname}`.trim() || 'Unnamed user'
}

function colorForUser(id: string) {
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) | 0
  return `hsl(${Math.abs(hash) % 360} 65% 42%)`
}

export function CardAssignees({ assigneeIds, users, variant = 'compact', disabled = false, loading = false, error, errorType = 'update', onChange, onOpenDetails, showLabel = true }: CardAssigneesProps) {
  const [query, setQuery] = useState('')
  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const assignedUsers = assigneeIds.map((id) => userById.get(id)).filter((user): user is User => !!user)

  if (variant === 'compact') {
    const visibleUsers = assignedUsers.slice(0, 3)
    const hiddenCount = Math.max(0, assigneeIds.length - visibleUsers.length)
    if (!visibleUsers.length && !hiddenCount) return null
    return (
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label={`Edit assignees for this card${assigneeIds.length ? `, ${assigneeIds.length} assigned` : ''}`}
        onClick={onOpenDetails}
        display="inline-flex"
        gap={0.5}
        px={1}
        py={0}
        h="1.75rem"
        minH="1.75rem"
        minW={0}
        maxW="6.5rem"
        overflow="hidden"
      >
        {visibleUsers.map((user) => (
          <Box
            key={user.id}
            aria-label={userName(user)}
            title={userName(user)}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg={colorForUser(user.id)}
            color="white"
            width="1.4rem"
            height="1.4rem"
            fontSize="xs"
            fontWeight="bold"
          >
            {initials(user)}
          </Box>
        ))}
        {hiddenCount > 0 && <Text aria-label={`${hiddenCount} hidden assignees`} title={`${hiddenCount} hidden assignees`} fontSize="2xs" fontWeight="bold">+{hiddenCount}</Text>}
      </Button>
    )
  }

  const normalizedQuery = query.trim().toLocaleLowerCase()
  const filteredUsers = users.filter((user) => {
    const name = `${user.firstname} ${user.lastname}`.toLocaleLowerCase()
    return !normalizedQuery || name.includes(normalizedQuery) || user.firstname.toLocaleLowerCase().includes(normalizedQuery) || user.lastname.toLocaleLowerCase().includes(normalizedQuery)
  })

  function toggle(userId: string) {
    if (!onChange || disabled) return
    const next = assigneeIds.includes(userId)
      ? assigneeIds.filter((id) => id !== userId)
      : [...assigneeIds, userId]
    if (!assigneeIds.includes(userId)) setQuery('')
    onChange(next)
  }

  return (
    <Stack gap={2} mt={showLabel ? 0 : undefined}>
      {showLabel && <Text fontWeight="medium">Assignees</Text>}
      <Box display="flex" flexWrap="wrap" gap={2} maxW="100%" overflow="hidden">
        {assignedUsers.map((user) => (
          <Button
            key={user.id}
            type="button"
            size="xs"
            variant="outline"
            disabled={disabled}
            onClick={() => toggle(user.id)}
            maxW="100%"
            minW={0}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {userName(user)} ×
          </Button>
        ))}
      </Box>
      <Input
        role="combobox"
        aria-label="Search assignees"
        aria-expanded="true"
        placeholder="Search users"
        value={query}
        disabled={disabled}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading && <Text role="status" color="fg.muted" fontSize="sm">Loading users…</Text>}
      <Box role="listbox" aria-label="Available assignees" maxH="12rem" overflowY="auto">
        {filteredUsers.map((user) => {
          const selected = assigneeIds.includes(user.id)
          return (
            <Button
              key={user.id}
              type="button"
              variant={selected ? 'subtle' : 'ghost'}
              width="100%"
              minW={0}
              maxW="100%"
              justifyContent="flex-start"
              disabled={disabled}
              aria-selected={selected}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              onClick={() => toggle(user.id)}
            >
              {selected ? '✓ ' : ''}{userName(user)}
            </Button>
          )
        })}
        {!filteredUsers.length && <Text color="fg.muted" fontSize="sm">No users found.</Text>}
      </Box>
      {error && <Text role="alert" color="red.700">Could not {errorType === 'load' ? 'load' : 'update'} assignees: {error}</Text>}
    </Stack>
  )
}
