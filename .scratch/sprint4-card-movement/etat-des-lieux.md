# État des lieux du Sprint 4 — 2026-10-09

Carte : [Préparer les déplacements persistants et leur célébration](map.md).

## Périmètre de l'inspection

Checkout courant `hugoc/sprint4`, HEAD `051d590`. Inspection de `src/`, données, README, configuration Vite, dépendances, documentation d'agents et tracker local. Aucun ancien prompt lu. Aucun autre dépôt exploré, aucun backend appelé et aucun code applicatif modifié. Le diff applicatif était vide au début ; les acquis du Sprint 3 sont déjà commités dans cette branche.

## Ce qui existe et peut être réutilisé

- `src/types/board.ts:1` : `BoardData`, `ColumnData`, `CardData`, avec ordre des colonnes/cartes porté par les tableaux ; description facultative.
- `src/components/Board.tsx:11` : grille responsive 1/2/4 colonnes ; rendu dans l'ordre des données.
- `src/components/Card.tsx:8` et `Column.tsx:9` : surfaces et bordures sémantiques, textes lisibles, gestion du texte long, message de colonne vide.
- `data/board.json` : quatre colonnes `sprint-backlog`, `doing`, `review`, `done`, six cartes ; Review vide, utile pour un test de dépôt.
- `src/main.tsx:14` : QueryClientProvider déjà présent. React Query, Immer/use-immer et Motion installés ; leur présence n'implique pas qu'ils soient utilisés pour déplacer les cartes.
- `src/components/Confetti.tsx:12` : animation existante, réutilisable après adaptation ciblée.

## Écart avec le drag-and-drop annoncé

Dans ce checkout, `Board`, `Column`, `Card` ne possèdent ni `draggable`, ni événements drag/drop, ni handlers des flèches clavier, ni état de déplacements. Aucun autre module de déplacement trouvé dans `src/`. Cela n'exclut pas une version dans une autre branche ou un autre dépôt, qui reste à identifier avant de conclure qu'il faut développer ces interactions.

Chrome DevTools MCP, lecture du DOM de `/board` : six articles affichés, tous `draggable=false` et `tabIndex=-1` ; colonnes Sprint backlog, Doing, Review, Done. Cette observation, complétée par l'inspection du code, confirme que les cartes ne sont actuellement ni rendues déplaçables ni accessibles par Tab. Aucun test d'un déplacement fonctionnel n'a donc été déclaré réussi.

## Données et backend

`src/pages/BoardPage.tsx:1` importe directement `data/board.json`. README:10 décrit un tableau en lecture seule. Aucun `fetch`, query ou mutation métier dans `src/`, aucun client API ni URL de backend trouvé. `vite.config.ts:5` n'a pas de proxy. Aucun backend présent dans ce dépôt.

Le seul contrat connu provient du message utilisateur :

```http
PUT /cards/:cardId
```

```json
{"column":"doing","position":1}
```

Réponse : `BoardData`. `position` est un indice basé sur zéro après retrait de la carte ; sans position, insertion à la fin. La réponse permet de réconcilier le tableau après mutation. Elle ne décrit pas comment lire l'état persisté au chargement : remplacer l'import statique par un endpoint supposé serait inventer un contrat. URL, lecture existante, disponibilité et persistance backend doivent être vérifiées sur une source réelle. Aucun besoin d'authentification ou de format d'erreur particulier n'est présumé.

## Confetti : disponible, mais non intégré

- Aucun import de Confetti ailleurs dans l'application.
- `particleCount` positif est un déclencheur ; il ne règle pas le nombre de particules : 40 sont toujours générées (`Confetti.tsx:20`). Son nom/interface méritent clarification avant intégration.
- Nettoyage du timeout existant (`:31–32`), animation de 1,5 s et suppression après 2 s.
- Aucun lien avec une réponse API, aucune détection d'arrivée depuis une autre colonne ni protection contre une célébration de réorganisation interne/rechargement.
- Aucune prise en compte de `prefers-reduced-motion`.
- Forme aléatoire choisie pendant le rendu (`:57`) : instabilité déjà signalée par le lint du Sprint 3. Les deux avertissements préexistants ne seront pas corrigés globalement ; une éventuelle adaptation doit servir directement l'intégration du composant.
- Placement absolu à intégrer dans un conteneur approprié ; éviter que l'animation ne bloque le clic/drag ou ne crée de débordement et la garder décorative pour les aides techniques.

## Décisions à prendre, pas encore validées

- Position des déplacements gauche/droite ; définition précise de l'insertion avant/après la carte visée et rejet des colonnes non voisines.
- État d'attente, échec, requêtes rapprochées et conservation du focus. Proposition à discuter : afficher le tableau confirmé, une mutation à la fois, aucun changement ni confettis en cas d'échec.
- Arrivée confirmée : proposition à discuter, une réponse valide reflétant le transfert depuis une autre colonne vers la dernière ; aucune célébration sur une réorganisation interne, un échec ou un rechargement.
- Réduction des mouvements : proposition à discuter, supprimer les confettis et conserver une confirmation accessible sans animation.
- Point de test et matrice de non-régression : intégration API réelle, interactions clavier/DnD, limites, persistance après rechargement, thèmes et responsive.

## Consignes du professeur et prochaines étapes

Aucune consigne distincte du professeur pour Sprint 4 trouvée dans les sources locales inspectées. Les exigences vérifiables sont celles du message utilisateur. Retrouver ces consignes, la version DnD annoncée et le backend est la première action ; confirmer ensuite les règles et la gestion des réponses, puis produire la spécification et les tickets d'implémentation. Autorisation explicite nécessaire avant l'implémentation, conformément à la demande utilisateur.

## Complément à la reprise — 2026-10-09

Les constats ci-dessus décrivent le checkout Sprint 4 lors de l'audit initial, pas l'ensemble de l'historique du projet. L'utilisateur a fourni les consignes professeur et les références manquantes : backend local au commit 9ab0b4a (égal à la ref locale origin/main), et branche hugoc/sprint2 au commit 5387444.

La version Sprint 2 contient sélection/clavier gauche-droite/focus/DnD et lecture via GET /boards/mini-trello, mais les déplacements sont locaux ; son helper PUT n'est pas appelé. Le backend fournit réellement GET /boards/:id et PUT /cards/:cardId avec position après retrait, réponse BoardData enrichie et persistance transactionnelle. Voir [réutilisation Sprint 2](sprint2-reuse.md) et [contrats backend](backend-contracts.md).

Les validations UX/techniques de l'utilisateur et les conséquences documentées ont été consignées dans les cinq tickets existants, maintenant résolus. Passage à to-spec proposé ; aucune implémentation, migration ou modification backend réalisée. La disponibilité effective du service reste non testée. Le démarrage API appelle automatiquement prepare et ne sera pas lancé sans autorisation spécifique.
