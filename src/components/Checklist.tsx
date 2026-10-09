import type { ChecklistItemData } from '../types/board'

/**
 * Checklist — section « Tâches à cocher » d'une carte.
 *
 * Responsabilité : lister les tâches, en ajouter une, la cocher puis la
 * décocher. Composant de présentation. Les items n'ont pas d'id fourni par
 * l'API : leur identité est leur index dans la liste.
 *
 * Props :
 * - items : ChecklistItemData[] — tâches de la carte.
 * - onChange : (items: ChecklistItemData[]) => void — remonte la liste complète.
 *
 * Action déclenchée : ajouter une tâche, basculer `done` → `onChange`.
 *
 * Cas à vérifier :
 * - Ajouter une tâche conserve les tâches existantes.
 * - Cocher/décocher ne modifie que la tâche visée.
 * - Une description vide n'est pas ajoutée.
 */
type ChecklistProps = {
  items: ChecklistItemData[]
  onChange: (items: ChecklistItemData[]) => void
}

export function Checklist(_props: ChecklistProps) {
  // Rendu temporaire : l'implémentation viendra après revue de la conception.
  return null
}
