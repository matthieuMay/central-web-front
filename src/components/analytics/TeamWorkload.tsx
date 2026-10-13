import { Badge, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { SprintAnalytics } from '../../analytics'
import { ChecklistProgress, MetricBar } from './MetricBar'
import { formatNumber } from './format'
import { Surface } from '../visual/Surface'
import { MemberAvatar } from '../visual/MemberAvatar'

function workloadComparisonLabel(activeCards: number, averageActiveCards: number): string {
  if (activeCards > averageActiveCards)
    return 'Au-dessus de la moyenne des cartes actives'
  if (activeCards < averageActiveCards)
    return 'En dessous de la moyenne des cartes actives'
  return 'À la moyenne des cartes actives'
}

export function TeamWorkload({ stats }: {
  stats: SprintAnalytics
}) {
  const { workload } = stats
  // Both series use the same scale across every member.
  const scale = Math.max(0, ...stats.members.flatMap(member => [member.active, member.completed]))
  return (
    <Stack as="section" aria-label="Team Workload" gap={5}>
      <Heading as="h2" size="lg">L’équipe en un coup d’œil</Heading>
      <Text>Comparaison des cartes actives attribuées, sans estimation d’effort ni de capacité.</Text>
      {stats.unavailableAssigneeCards > 0 && <Text role="status">{stats.unavailableAssigneeCards} carte(s) ont au moins un membre indisponible dans la liste des utilisateurs. Ces assignations restent comptées globalement.</Text>}
      {stats.members.length === 0 ? <Text>Aucun membre disponible.</Text> : <>
        <Text>Moyenne : {formatNumber(workload.average ?? 0)} carte(s) active(s) par membre. Minimum : {workload.min} ; maximum : {workload.max} ; écart : {workload.gap}.</Text>
        <Text>
          {workload.gap === 0 ? 'Tous les membres ont le même nombre de cartes actives.' : 'Les nombres de cartes actives diffèrent entre membres ; les personnes au-dessus de la moyenne sont indiquées ci-dessous.'}
        </Text>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {stats.members.map(member => {
            const averageActiveCards = workload.average ?? 0
            const aboveAverage = member.active > averageActiveCards
            const comparisonLabel = workloadComparisonLabel(member.active, averageActiveCards)
            return <Surface as="article" key={member.id} aria-label={member.name}>
              <Stack gap={4}>
                <Flex gap={3} align="center">
                  <MemberAvatar name={member.name} size="md" />
                  <Stack gap={1} minW={0}>
                    <Heading as="h3" size="md" overflowWrap="anywhere">{member.name}</Heading>
                    <Text color="fg.muted" fontSize="sm">{member.total} carte(s) attribuée(s)</Text>
                  </Stack>
                </Flex>
                <Badge
                  alignSelf="start"
                  whiteSpace="normal"
                  bg={aboveAverage ? 'tone.orange.surface' : 'bg.muted'}
                  color={aboveAverage ? 'tone.orange.accent' : 'fg.muted'}
                  p={2}
                  borderRadius="lg"
                >
                  {comparisonLabel}
                </Badge>
                <MetricBar
                  label="Actives"
                  value={member.active}
                  total={scale}
                  detail={`${member.active} carte(s)`}
                />
                <MetricBar
                  label="Terminées"
                  value={member.completed}
                  total={scale}
                  detail={`${member.completed} carte(s)`}
                  completed
                />
                <ChecklistProgress value={member.checklist} />
              </Stack>
            </Surface>
          })}
        </SimpleGrid>
      </>}
    </Stack>
  )
}
