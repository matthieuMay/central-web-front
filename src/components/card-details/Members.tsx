import { useId, useRef, useState } from 'react'
import { Button, Heading, Stack, Text } from '@chakra-ui/react'
import { userName } from '../../card-editing'
import type { EditorProps, UsersProps } from './types'
import { MemberAvatar } from '../visual/MemberAvatar'

export function Members({ assignees, users, usersUnavailable, blocked, onEdit }: EditorProps & UsersProps & {
  assignees: string[]
}) {
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const [userId, setUserId] = useState('')
  const available = users.filter(user => !assignees.includes(user.id))
  return (
    <Stack as="section" aria-label="Membres" gap={3}>
      <Heading
        as="h3"
        size="md"
        ref={heading}
        tabIndex={-1}
      >
        Membres
      </Heading>
      {assignees.length === 0 && <Text color="fg.muted">Aucun membre associé.</Text>}
      {assignees.map(member => <Stack
        key={member}
        direction="row"
        align="center"
        justify="space-between"
      >
        <Stack
          direction="row"
          gap={2}
          align="center"
          minW={0}
        >
          <MemberAvatar name={userName(users, member)} />
          <Text overflowWrap="anywhere">{userName(users, member)}</Text>
        </Stack>
        <Button
          size="sm"
          variant="outline"
          disabled={blocked}
          onClick={async (event) => {
            const trigger = event.currentTarget
            const ownedFocus = document.activeElement === trigger
            const dialog = trigger.closest('dialog')
            if (await onEdit({ kind: 'remove-member', userId: member })) {
              const activeElement = document.activeElement
              const canRestoreFocus = activeElement === trigger ||
                activeElement === document.body || activeElement === dialog
              if (ownedFocus && canRestoreFocus)
                heading.current?.focus()
            }
          }}
          aria-label={`Retirer ${userName(users, member)}`}
        >
          Retirer
        </Button>
      </Stack>)}
      <form onSubmit={async (event) => {
        event.preventDefault()
        if (await onEdit({ kind: 'add-member', userId }))
          setUserId('')
      }}>
        <Stack gap={2}>
          <label htmlFor={id}>Ajouter un membre</label>
          <select
            id={id}
            className="card-select"
            value={userId}
            disabled={blocked || usersUnavailable}
            required
            onChange={event => setUserId(event.currentTarget.value)}
          >
            <option value="">Choisir un utilisateur</option>
            {available.map(user => <option key={user.id} value={user.id}>{userName(users, user.id)}</option>)}
          </select>
          <Button
            type="submit"
            alignSelf="start"
            disabled={blocked || usersUnavailable || !userId || !available.some(user => user.id === userId)}
          >
            Associer
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
