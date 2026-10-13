import { Badge, Box, Button, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { Surface } from '../components/visual/Surface'

export function HomePage() {
  return (
    <Stack gap={{ base: 8, md: 12 }} maxW="1200px" mx="auto">

      <Surface
        p={{ base: 6, md: 10 }}
        bgGradient="to-br"
        gradientFrom="tone.violet.surface"
        gradientTo="tone.sky.surface"
      >

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={10} alignItems="center">

          <Stack gap={6}>

            <Badge
              alignSelf="start"
              bg="tone.violet.badge"
              color="tone.violet.accent"
              borderRadius="full"
              px={3}
              py={2}
            >
              Bienvenue sur Mini-Trello
            </Badge>
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '5xl', xl: '6xl' }}
              lineHeight="1.1"
              letterSpacing="tight"
            >

              Vos idées prennent forme.
              <Box
                as="span"
                display="block"
                color="brand.fg"
                mt={2}
              >
                Votre équipe avance.
              </Box>
            </Heading>
            <Text color="fg.muted" fontSize="lg" lineHeight="1.7">
              Un tableau pour organiser le travail, des cartes pour collaborer et une vue claire pour suivre votre sprint. Tout simplement.
            </Text>
            <Flex gap={3} wrap="wrap">

              <Button asChild size="lg"><RouterLink to="/board">Ouvrir le tableau</RouterLink></Button>
              <Button asChild size="lg" variant="outline">
                <RouterLink to="/analytics">Explorer Analytics</RouterLink>
              </Button>
            </Flex>
          </Stack>
          <Box
            aria-hidden="true"
            bg="bg"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border"
            p={{ base: 4, md: 6 }}
            boxShadow="elevated"
          >

            <Flex gap={2} mb={5}>
              <Box
                w="16"
                h="3"
                bg="tone.violet.badge"
                borderRadius="full"
              />
              <Box
                w="8"
                h="3"
                bg="tone.teal.badge"
                borderRadius="full"
              />
            </Flex>
            <SimpleGrid columns={4} gap={2}>

              {(['sky', 'violet', 'orange', 'teal'] as const).map((tone, index) => <Stack
                key={tone}
                bg={`tone.${tone}.surface`}
                borderRadius="xl"
                p={2}
                gap={3}
                minH="190px"
              >

                <Box
                  bg={`tone.${tone}.accent`}
                  h="4px"
                  w="60%"
                  borderRadius="full"
                />
                {Array.from({ length: index === 3 ? 1 : 2 }, (_, item) => <Box
                  key={item}
                  bg="bg"
                  p={2}
                  borderRadius="lg"
                  boxShadow="card"
                >

                  <Box
                    bg={`tone.${tone}.badge`}
                    h="5px"
                    w="80%"
                    borderRadius="full"
                    mb={2}
                  />
                  <Box
                    bg="bg.muted"
                    h="5px"
                    w="60%"
                    borderRadius="full"
                  />
                </Box>)}
              </Stack>)}
            </SimpleGrid>
          </Box>
        </SimpleGrid>
      </Surface>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>

        <Surface tone="sky">
          <Heading as="h2" size="lg" mb={3}>Organisez</Heading>
          <Text color="fg.muted">
            De l’idée à la dernière colonne, gardez vos cartes à portée de main. Déplacez-les à la souris ou au clavier.
          </Text>
        </Surface>
        <Surface tone="violet">
          <Heading as="h2" size="lg" mb={3}>Collaborez</Heading>
          <Text color="fg.muted">
            Associez les membres, échangez dans les commentaires et avancez tâche par tâche avec les checklists.
          </Text>
        </Surface>
        <Surface tone="teal">
          <Heading as="h2" size="lg" mb={3}>Prenez du recul</Heading>
          <Text color="fg.muted">
            Visualisez la progression du sprint et la répartition des cartes dans l’équipe avec Analytics.
          </Text>
        </Surface>
      </SimpleGrid>
    </Stack>
  )
}
