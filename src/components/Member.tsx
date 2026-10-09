export function Member() {
  return <></>
}

///Members est la feature qui permet de mettre des vignettes utilisateurs sur les différentes tasks
// en props on aura les id, les noms, peut être les photos de profil et un lien clickable d'accès vers ce membre
//le déclencheur sera le clic sur le + d'ajout d'un membre qui ajoutera la vignette du membre connecté à la session, et le survol affichera le nom de la vignette
// les données sont dans le back car elles doivent pouvoir être mémorisées
// On fera attention à l'agencement et la taille des vignettes pour ne pas déborder, peut être prévoir une vignette [...] afin de limiter à 3 le nombre de vignettes