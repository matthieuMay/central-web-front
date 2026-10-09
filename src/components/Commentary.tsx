export function Commentary() {
  return <></>
}

/// Le commentaire sert à apporter des précisions à une carte, il est rédigé par un membre donc ses props seront liés à ceux de la carte et ceux des membres.
// Son déclencheur est le clic sur la zone d'input de texte, et a comme action la création d'un commentaire, qui sera ensuite affiché sur la carte.
// Comme on veut garder en mémoire les commentaires, les données vont venir du back 
// Un comportement correct observé sera la persistance d'un commentaire après actualisation de la page, et la perte de celui ci s'il n'a pas été validé par l'utilisateur.