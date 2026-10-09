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

export function Assignees(_props: AssigneesProps) {
  // Rendu temporaire : l'implémentation viendra après revue de la conception.
  return null
}
