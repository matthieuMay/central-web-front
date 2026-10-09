import { Dialog, Portal, Stack } from '@chakra-ui/react'
import type { CardData, CardCollectionsPatch, UserData } from '../types/board'
import { Assignees } from './Assignees'
import { Comments } from './Comments'
import { Checklist } from './Checklist'

/**
 * CardDetails — conteneur de la « carte riche ».
 *
 * Responsabilité : présenter, pour une seule carte, ses trois collections
 * (membres, commentaires, tâches à cocher) et relayer chaque changement vers
 * le parent. Composant de présentation : il ne détient aucune donnée, il lit
 * `card` et remonte les modifications via `onPatch`.
 *
 * Props :
 * - card : CardData — la carte affichée (source : cache React Query du board).
 * - users : UserData[] — les personnes disponibles (source : GET /users).
 * - onPatch : (patch: CardCollectionsPatch) => void — remonte un changement
 *   partiel de collections ; le parent applique le PATCH.
 * - onClose : () => void — AJOUT APRÈS CONCEPTION : le dialogue doit pouvoir
 *   se fermer ; le parent (Board) détient la sélection et la remet à null.
 *
 * Action déclenchée : ajout/retrait d'un membre, publication d'un commentaire,
 * ajout ou coche d'une tâche → `onPatch` ; fermeture → `onClose`.
 *
 * Cas à vérifier :
 * - Ouvrir la carte affiche les valeurs courantes des trois listes.
 * - Ajouter un membre conserve les membres déjà assignés.
 * - Publier un commentaire conserve les commentaires existants et leurs dates.
 * - Cocher/décocher une tâche ne modifie pas les autres tâches.
 */
type CardDetailsProps = {
  card: CardData
  users: UserData[]
  onPatch: (patch: CardCollectionsPatch) => void
  onClose: () => void
}

export function CardDetails({ card, users, onPatch, onClose }: CardDetailsProps) {
  return (
    <Dialog.Root
      open
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{card.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Stack gap={6}>
                <Assignees
                  assignees={card.assignees}
                  users={users}
                  onChange={(assignees) => onPatch({ assignees })}
                />
                <Comments
                  comments={card.comments}
                  users={users}
                  onChange={(comments) => onPatch({ comments })}
                />
                <Checklist
                  items={card.checklistItems}
                  onChange={(checklistItems) => onPatch({ checklistItems })}
                />
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
