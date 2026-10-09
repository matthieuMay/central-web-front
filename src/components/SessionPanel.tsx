import { Box, Button, Menu, Portal, Text } from '@chakra-ui/react'
import { useSession } from '../session/SessionContext'

export function SessionPanel() {
  const { user, isAnonymous, users, chooseUser, displayName } = useSession()
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button type="button" size="sm" variant="outline" aria-label="Change session">
          {user === undefined ? 'Choose session' : isAnonymous || !user ? 'Anonymous' : displayName(user)}
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="anonymous" onClick={() => chooseUser(null)}>Continue anonymously</Menu.Item>
            {users?.map((available) => (
              <Menu.Item key={available.id} value={available.id} onClick={() => chooseUser(available)}>
                {displayName(available)}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}

export function SessionChooser() {
  const { users, usersPending, usersError, chooseUser, displayName } = useSession()
  return (
    <Box role="dialog" aria-labelledby="session-title" borderWidth="1px" borderRadius="lg" p={6} maxW="lg" mx="auto">
      <Text id="session-title" fontSize="xl" fontWeight="bold" mb={2}>Choose your session</Text>
      <Text mb={4}>Select a name to comment, or continue anonymously to read the board.</Text>
      {usersPending && <Text role="status">Loading users…</Text>}
      {usersError && <Text role="alert" color="red.700">Could not load users: {usersError.message}. Retry the page to try again.</Text>}
      {users?.map((user) => <Button key={user.id} type="button" mr={2} mb={2} onClick={() => chooseUser(user)}>{displayName(user)}</Button>)}
      <Button type="button" variant="outline" onClick={() => chooseUser(null)}>Continue anonymously</Button>
    </Box>
  )
}
