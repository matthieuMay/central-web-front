# Réutilisation du Sprint 2 — inspection du 2026-10-09

Source : branche `hugoc/sprint2`, commit `5387444c7f62792d59e203b94e0b8da867cb290c`, inspectée avec `git show` et `git grep` sans checkout, merge ou cherry-pick.

## Interactions réutilisables

- `src/components/Card.tsx` : carte focusable, identifiant `data-card-id`, sélection par clic/Entrée/Espace, dragstart avec `text/plain` contenant l'identifiant. Contrôles gauche/droite désactivés aux limites.
- `src/components/Column.tsx` : handlers dragover/drop, zone de dépôt englobant la colonne vide, indicateur de survol et retrait de cet indicateur lorsque le pointeur quitte la zone.
- `src/components/Board.tsx` : recherche de colonne d'origine, calcul des voisines par ordre des données, sélection, Échap et restauration du focus après mouvement ; protection de certains champs interactifs dans le handler clavier.
- `src/api/board.ts` : clé TanStack Query `['board', 'mini-trello']`, URL configurable par `VITE_API_URL` avec localhost:3000 par défaut, helper HTTP vérifiant `response.ok`, lecture réelle `/boards/mini-trello`.
- `src/pages/BoardPage.tsx` : `useQuery` et états chargement/erreur, sans fallback silencieux vers le JSON statique.

## Adaptations nécessaires

- Les mouvements de Board restent locaux : `setBoardData` n'appelle pas l'API. Le helper `moveCardApi` est déclaré mais jamais utilisé ailleurs dans cette branche, résultat confirmé par `git grep`.
- Ce helper type la réponse `void`, n'envoie que `column` et doit être adapté à la réponse `BoardData` ainsi qu'à `position` facultative.
- L'état `useState(board)` duplique la donnée initiale ; sans réconciliation, une lecture serveur ultérieure ne suffit pas à rafraîchir cette copie. Préférer le tableau confirmé du cache TanStack Query comme source, en gardant sélection/focus/drag comme états UI.
- Aucun haut/bas ; les déplacements vers la même colonne sont rejetés et l'insertion est toujours en fin. Le drag permet toute colonne, sans restriction de voisinage ni cible d'insertion.
- Le handler clavier global peut agir alors que le focus n'est plus sur la carte. Limiter les commandes au contexte de la carte et protéger liens/champs/contrôles internes.
- Le focus après drag n'est pas géré comme celui après mouvement clavier ; adapter après succès confirmé.
- `Card` utilise une surface ayant `role=button` et des boutons internes conditionnels. Ne pas recopier sans examiner l'imbrication interactive ; conserver la sémantique article et des contrôles accessibles séparés si nécessaire.
- Couleurs fixes `white`, `gray.*`, `blue.50/100` : conserver les couleurs sémantiques et contrastes du Sprint 3 au lieu de remplacer les composants complets.
- Les mutations optimistes de création/édition dans `src/api/mutations.ts` ne sont pas requises pour déplacer les cartes. Ne pas importer leur ledger multi-écritures : le Sprint 4 autorise une seule mutation et un rendu confirmé simple.
- Confetti n'est pas présent dans cette branche ; réutiliser celui du checkout actuel avec les adaptations de confirmation et reduced-motion.

Inspection statique uniquement : les interactions historiques n'ont pas été exécutées ni déclarées validées dans le navigateur. La réutilisation sera ciblée, soumise aux tests de la future implémentation.
