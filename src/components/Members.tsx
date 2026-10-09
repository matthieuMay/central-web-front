import { Box, Button, Menu, Text } from '@chakra-ui/react'
import { Fragment } from 'react'
import { memberById, memberLabel, members } from '../data/members'

export function MemberName({ memberId }: { memberId: string }) {
  const member = memberById(memberId)
  if (!member) return <Text as="span" color="fg.muted">Membre inconnu</Text>
  return <Text as="span" fontWeight="semibold" color={`${member.color}.fg`}>{memberLabel(member)}</Text>
}

export function MemberList({ memberIds }: { memberIds: string[] }) {
  return memberIds.map((id, index) => (
    <Fragment key={id}>{index > 0 && ', '}<MemberName memberId={id} /></Fragment>
  ))
}

type MembersProps = { memberIds: string[] }

export function Members({ memberIds }: MembersProps) {
  return (
    <Text fontSize="xs" color="fg.muted" mt={1}>
      Assigné à : {memberIds.length ? <MemberList memberIds={memberIds} /> : 'personne'}
    </Text>
  )
}

type MemberPickerProps = { label: string; value: string[]; onChange: (memberIds: string[]) => void }

// A dropdown listing every Member with a box to tick; stays open while ticking.
// Fixed positioning keeps the list from being clipped by the dialog's scroll area.
export function MemberPicker({ label, value, onChange }: MemberPickerProps) {
  return (
    <Menu.Root closeOnSelect={false} positioning={{ strategy: 'fixed' }}>
      <Menu.Trigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={label} justifyContent="space-between" minW="14rem" fontWeight="normal">
          <Text as="span" truncate>{value.length ? <MemberList memberIds={value} /> : 'Choisir des membres'}</Text>
          <span aria-hidden>▾</span>
        </Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content minW="14rem">
          {members.map((member) => {
            const checked = value.includes(member.id)
            return (
              <Menu.CheckboxItem key={member.id} value={member.id} checked={checked}
                onCheckedChange={(next) => onChange(next ? [...value, member.id] : value.filter((id) => id !== member.id))}>
                <Box as="span" aria-hidden display="inline-flex" alignItems="center" justifyContent="center" boxSize="4" flexShrink={0}
                  borderWidth="1px" borderColor={checked ? 'colorPalette.solid' : 'border.emphasized'} borderRadius="sm"
                  bg={checked ? 'colorPalette.solid' : undefined} color="colorPalette.contrast" fontSize="xs" colorPalette="blue">
                  {checked && '✓'}
                </Box>
                <Text as="span" color={`${member.color}.fg`}>{member.firstName} {member.lastName}</Text>
              </Menu.CheckboxItem>
            )
          })}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}
