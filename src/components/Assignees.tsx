import { HStack, NativeSelect, Stack, Tag, Text } from '@chakra-ui/react'
import type { UserData } from '../types/board'

/**
 * Assignees — section « Membres » d'une carte.
 *
 * Responsabilité : afficher les personnes assignées et permettre d'en ajouter
 * ou d'en retirer parmi celles fournies par l'API. Composant de présentation :
 * il ne détient pas la donnée, il la reçoit et remonte la nouvelle liste.
 *
 * Props :
 * - assignees : string[] — ids des utilisateurs assignés (source : la carte).
 * - users : UserData[] — personnes disponibles (source : GET /users).
 * - onChange : (assignees: string[]) => void — remonte la liste complète à jour.
 *
 * Action déclenchée : ajouter/retirer un membre → `onChange`.
 *
 * Cas à vérifier :
 * - Ajouter un membre renvoie la liste précédente + le nouveau (aucune perte).
 * - Retirer un membre ne retire que celui-ci.
 * - Un membre déjà assigné n'est pas proposé une seconde fois.
 * - Les ids envoyés existent bien dans `users`.
 */
type AssigneesProps = {
  assignees: string[]
  users: UserData[]
  onChange: (assignees: string[]) => void
}

function fullName(user: UserData) {
  return `${user.firstname} ${user.lastname}`
}

export function Assignees({ assignees, users, onChange }: AssigneesProps) {
  const assigned = users.filter((user) => assignees.includes(user.id))
  const available = users.filter((user) => !assignees.includes(user.id))

  return (
    <Stack gap={2}>
      <Text fontWeight="medium">Members</Text>
      {assigned.length === 0 ? (
        <Text color="fg.muted" fontSize="sm">
          No members yet
        </Text>
      ) : (
        <HStack gap={2} flexWrap="wrap">
          {assigned.map((user) => (
            <Tag.Root key={user.id} size="sm">
              <Tag.Label>{fullName(user)}</Tag.Label>
              <Tag.CloseTrigger
                aria-label={`Remove ${fullName(user)}`}
                onClick={() => onChange(assignees.filter((id) => id !== user.id))}
              />
            </Tag.Root>
          ))}
        </HStack>
      )}
      <NativeSelect.Root size="sm" disabled={available.length === 0}>
        <NativeSelect.Field
          value=""
          aria-label="Add a member"
          onChange={(event) => {
            const id = event.target.value
            if (id) onChange([...assignees, id])
          }}
        >
          <option value="">Add a member…</option>
          {available.map((user) => (
            <option key={user.id} value={user.id}>
              {fullName(user)}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Stack>
  )
}
