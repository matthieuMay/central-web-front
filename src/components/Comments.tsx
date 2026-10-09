import type { CommentData, CommentInput, UserData } from '../types/board'

/**
 * Comments — section « Commentaires » d'une carte.
 *
 * Responsabilité : lister l'activité (auteur, texte, date) et publier un
 * nouveau commentaire avec un auteur choisi dans l'interface. Composant de
 * présentation : il reçoit la liste et remonte la liste complète mise à jour.
 *
 * Props :
 * - comments : CommentData[] — commentaires existants (source : la carte).
 * - users : UserData[] — auteurs possibles (source : GET /users).
 * - onChange : (comments: CommentInput[]) => void — remonte la liste complète.
 *
 * Action déclenchée : publier un commentaire → `onChange`.
 *
 * Cas à vérifier :
 * - Un nouveau commentaire est envoyé sans `createdAt` (l'API crée la date).
 * - Les commentaires existants sont renvoyés avec leur `createdAt` d'origine.
 * - Un texte vide ou un auteur manquant n'est pas publié.
 * - L'ordre d'ajout est conservé.
 */
type CommentsProps = {
  comments: CommentData[]
  users: UserData[]
  onChange: (comments: CommentInput[]) => void
}

export function Comments(_props: CommentsProps) {
  // Rendu temporaire : l'implémentation viendra après revue de la conception.
  return null
}
