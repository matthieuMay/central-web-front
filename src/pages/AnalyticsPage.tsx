import { Button, Heading, Stack, Text } from '@chakra-ui/react'
import { useIsMutating, useQuery } from '@tanstack/react-query'
import { boardKey, boardWriteKey, getBoard, getUsers, usersKey } from '../api/board'
import { calculateSprintAnalytics } from '../analytics'
import { SprintOverview } from '../components/analytics/SprintOverview'
import { TeamWorkload } from '../components/analytics/TeamWorkload'

export function AnalyticsPage() {
  const writing = useIsMutating({ mutationKey: boardWriteKey }) > 0
  const board = useQuery({
    queryKey: boardKey,
    queryFn: ({ signal }) => getBoard(signal),
    enabled: !writing,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
  const users = useQuery({
    queryKey: usersKey,
    queryFn: ({ signal }) => getUsers(signal),
    retry: false,
    staleTime: Infinity,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
  const refreshing = board.isFetching || users.isFetching
  const stats = board.data ? calculateSprintAnalytics(board.data, users.data ?? []) : undefined
  return <Stack gap={8}>
    <Stack gap={3}>
      <Text color="brand.fg" fontWeight="semibold" fontSize="sm">VOTRE SPRINT, EN PERSPECTIVE</Text>
      <Heading as="h1" size="2xl">Sprint Analytics &amp; Team Workload</Heading>
      <Text>Un instantané du tableau actuel et de ses assignations.</Text>
      <Button
        alignSelf="start"
        variant="outline"
        disabled={writing || refreshing}
        onClick={() => {
          void board.refetch()
          void users.refetch()
        }}
      >
        Actualiser les statistiques
      </Button>
      {(refreshing || writing) && <Text role="status">
        {writing ? 'Enregistrement du tableau en cours. Statistiques issues du dernier état confirmé.' : 'Chargement des statistiques…'}
      </Text>}
      {board.isError && <Text role="alert">
        Impossible de charger le tableau.
        {board.data ? ' Les dernières données reçues sont affichées ; elles peuvent être anciennes.' : ''} Utilisez Actualiser pour réessayer.
      </Text>}
      {users.isError && <Text role="alert">
        Impossible de charger les utilisateurs.
        {users.data ? ' La dernière liste reçue est affichée ; elle peut être ancienne.' : ' La charge par membre est indisponible.'} Utilisez Actualiser pour réessayer.
      </Text>}
    </Stack>
    {stats && <SprintOverview stats={stats} />}
    {stats && users.data && <TeamWorkload stats={stats} />}
    <Stack
      as="section"
      aria-label="Règles de calcul"
      gap={3}
      bg="bg"
      borderWidth="1px"
      borderColor="border"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
    >
      <Heading as="h2" size="lg">Règles de calcul</Heading>
      <Text>
        Une carte est terminée lorsqu’elle est dans la dernière colonne du tableau ; toutes les autres sont actives. Le total global compte chaque carte une seule fois.
      </Text>
      <Text>
        Une carte multi-assignée compte une fois pour chaque membre, avec toutes ses tâches. Les totaux individuels ne s’additionnent donc pas pour obtenir le total global. Sans assignation signifie aucun membre associé ; un identifiant indisponible reste une assignation.
      </Text>
      <Text>
        Les progressions comptent les tâches terminées sur toutes les tâches des cartes concernées, actives comme terminées. Aucune tâche signifie « aucune tâche », et aucun dénominateur signifie un pourcentage non applicable.
      </Text>
      <Text>
        La moyenne de charge inclut tous les utilisateurs disponibles, même sans carte. Les identifiants indisponibles en sont exclus. L’écart est la différence entre maximum et minimum des cartes actives. Les barres de charge utilisent une échelle commune ; leurs valeurs restent écrites en toutes lettres.
      </Text>
    </Stack>
  </Stack>
}
