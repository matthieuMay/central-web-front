# Arrêter les points de test et les preuves d'acceptation du Sprint

Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: resolved
Blocked by: 01, 02, 03, 04
Parent: [Préparer les déplacements persistants et leur célébration](../map.md)

## Question

Prérequis : [Retrouver les consignes et les sources de l'existant](01-sources-existing-work.md), [Fixer les règles de déplacement et d'insertion](02-movement-rules.md), [Définir la confirmation, les erreurs et les déplacements rapprochés](03-confirmation-failures.md) et [Définir la célébration d'une arrivée confirmée et la réduction des mouvements](04-confirmed-celebration.md).

Quels points de test convenus prouvent les interactions, la persistance réelle et l'absence de célébration prématurée, sans coupler les tests aux détails des hooks ?

Proposer navigateur pour clavier, DnD, limites, insertion et colonne vide ; contrat réseau réellement connu pour corps PUT et réponse BoardData ; rechargement via lecture backend vérifiée pour persistance ; confirmations lentes/échouées et reduced-motion pour confettis ; conservation focus, thèmes et grille responsive.

La proposition d'un test automatisé supplémentaire ou d'un framework devra être justifiée par un manque concret. Réutiliser Chrome DevTools MCP et les outils déjà présents. Après décisions : rédiger spec et tickets d'implémentation ciblés, sans exécuter leur travail avant autorisation.

## Answer

Cadrage de validation arrêté le 2026-10-09 : les frontières publiques pertinentes sont l'application navigateur et le contrat HTTP existant. Les détails de hooks ou classes CSS ne sont pas des assertions métier. Aucun framework supplémentaire requis à ce stade. La matrice ci-dessous devra être intégrée à la spécification à valider ; aucun test de Sprint 4 livré n'est déclaré exécuté.

- Chrome DevTools MCP : sélectionner/focaliser une carte, gauche/droite et ajout en fin, haut/bas, limites sans mutation, focus conservé et champs protégés.
- DnD réel : avant/après dans même colonne, cible voisine, colonne vide et fin, colonne distante refusée, dépôt sans effet et cancellation ; corps PUT calculé après retrait.
- Réseau : un PUT en vol, pas de deuxième mouvement accepté pendant l'attente, aucun tableau optimiste présenté confirmé, réponse entière réconciliée ; refus explicite sans déplacement ni célébration ; perte réseau avec resynchronisation et sans retry automatique.
- Persistance : succès PUT, rechargement et GET /boards/mini-trello, localisation et ordre conservés. Préserver les champs enrichis des cartes, sans créer/éditer utilisateurs/commentaires/checklists.
- Célébration : réponse volontairement retardée, aucune particule avant confirmation, une célébration seulement après arrivée éligible ; rien après réorganisation interne, échec ou rechargement.
- Reduced-motion émulation active avant déplacement et pendant animation : absence/arrêt des confettis, confirmation accessible conservée.
- Non-régression Sprint 3 : routes, navigation, thème système et choix manuel, contrastes sélection/focus/drop, grille 1/2/4 colonnes et textes longs.
- Contrôles locaux de la future version : typage, lint, build, diff --check et revue code-review ; distinguer les avertissements préexistants.

Les tests backend existants documentent le contrat mais n'ont pas été lancés. Aucun test qui migre/réinitialise la base n'est autorisé par cette résolution. Les futurs tests d'intégration nécessitent un service disponible ; dev/start du backend ne sera exécuté qu'après autorisation spécifique, car il prépare/migre la base.

Passage à to-spec proposé pour formaliser ces décisions et faire valider les critères avant tout travail applicatif. Si des tests automatisés sont ajoutés, confirmer leurs points de test avec le skill tdd avant de les écrire.
