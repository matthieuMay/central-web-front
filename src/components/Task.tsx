export function Task() {
  return <></>
}

/// task doit pouvoir montrer l'état de complétion de la tâche et pourquoi pas devenir un déclencheur pour traiter la carte si toutes les task sont remplies
//en props il recoit du click et l'état de complétion
// il est déclenché par du click dans la zone a cocher, il déclenche l'ajout d'une vignette membre a coté et le remplissage de la case, et il déclenche le déplacement de la carte vers les tâches traitées quand c'est complet
// données dans l'api et le back
// il faut faire attention à ce que les déplacements et mouvements n'interferent pas entre eux car on va ajouter les vignettes task aux mouvements des cartes donc attention si les membres n'étaient pas présent dans la colonne de la carte d'origine par ex
