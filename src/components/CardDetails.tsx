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
 *
 * Action déclenchée : ajout/retrait d'un membre, publication d'un commentaire,
 * ajout ou coche d'une tâche → `onPatch`.
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
}

export function CardDetails({ card, users, onPatch }: CardDetailsProps) {
  // Rendu temporaire : l'implémentation viendra après revue de la conception.
  return (
    <>
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
    </>
  )
}
