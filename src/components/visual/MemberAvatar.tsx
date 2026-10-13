import { Avatar } from '@chakra-ui/react'

export function MemberAvatar({ name, size = 'sm' }: {
  name: string
  size?: 'sm' | 'md'
}) {
  return <Avatar.Root
    size={size}
    bg="tone.violet.badge"
    color="tone.violet.accent"
    borderWidth="2px"
    borderColor="bg"
    role="img"
    aria-label={name}
    title={name}
    flexShrink={0}
  >
    <Avatar.Fallback name={name} aria-hidden="true" />
  </Avatar.Root>
}
