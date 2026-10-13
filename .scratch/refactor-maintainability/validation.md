# Maintenabilité — rapport final

13 octobre 2026, branche hugoc/sprint6. Aucun commit ni push. Travaux Sprint 6 et Design V2 préexistants conservés.

## Arborescence finale

```text
src/
├── api/board.ts
├── types/board.ts
├── board-movement.ts
├── board-state.ts
├── card-editing.ts
├── analytics.ts
├── hooks/
│   ├── useBoardController.ts
│   └── useTheme.ts
├── components/
│   ├── Board.tsx / Column.tsx / Card.tsx / CardDetails.tsx
│   ├── Header.tsx / Layout.tsx / Confetti.tsx
│   ├── card-details/
│   │   ├── Members.tsx / Comments.tsx / Checklist.tsx
│   │   ├── ChecklistTask.tsx
│   │   └── types.ts
│   ├── analytics/
│   │   ├── SprintOverview.tsx / TeamWorkload.tsx / MetricBar.tsx
│   │   └── format.ts
│   └── visual/
│       ├── Surface.tsx / StatTile.tsx / MemberAvatar.tsx
│       └── column-tone.ts
├── pages/
│   ├── HomePage.tsx / BoardPage.tsx / AnalyticsPage.tsx
│   └── NotFoundPage.tsx
├── theme.ts
├── index.css
├── App.tsx
└── main.tsx
tests/
├── analytics.test.mjs
└── card-state.test.mjs
```

## Fichiers et responsabilités

- Créés : `src/board-state.ts`, `src/components/card-details/ChecklistTask.tsx`, `tests/card-state.test.mjs`, ce rapport, `spec.md` et le prompt initial.
- Aucun fichier déplacé ou supprimé. La fonction Task auparavant interne à Checklist devient ChecklistTask dans son propre module. Le type DropTarget rejoint board-movement, supprimant la dépendance de type de Column vers son parent Board.
- `useBoardController` : orchestration des effets, cache et verrou au niveau QueryClient. Étapes nommées prepareEdit, persistWrite, reconcileWrite, performWrite ; executeWrite garde autorisation, confirmation, messages et libération du verrou.
- `board-state` : recherche de carte, remplacement immuable d'une réponse CardData dans le BoardData complet et vérification de l'entrée dans la dernière colonne.
- `card-editing` : construction d'une seule liste PATCH ; updateChecklistItem conserve la validation index/snapshot et getChronologicalComments trie une copie avec indices stables.
- `api/board` : transport et validation ; isUser et confirmsCardCollections rendent explicites les contrats de réponse.
- `Checklist` : liste et ajout de tâches ; `ChecklistTask` : brouillon d'édition, snapshot, enregistrement/annulation et restitution du focus.
- `Card` : sélecteur de contrôles internes partagé et compte de tâches calculé une seule fois. `TeamWorkload` : comparaison nommée au lieu d'un ternaire imbriqué. Les détails de checklist sont calculés avant JSX dans les présentations Analytics.
- Présentation : props et types étalés, imports et objets lisibles, tokens inchangés. TypeScript strict activé dans tsconfig.app et tsconfig.node. Aucun any explicite introduit.
- README réécrit en français avec les douze sections demandées ; package.json et package-lock.json inchangés.

La comparaison de cette passe utilise `C:/Users/hugoc/AppData/Local/Temp/refactor-baseline-20261013T170110Z`, capturé avant modification. HEAD seul aurait inclus les changements Sprint 6/Design V2 antérieurs.

## Lisibilité et préservation

Le formatage a utilisé le compilateur TypeScript déjà installé, sans outil ni dépendance supplémentaires. Avant écriture, les tokens du JavaScript compilé ont été comparés, en normalisant les seules chaînes littérales équivalentes. Les modifications de whitespace JSX altérant des espaces significatifs ont été refusées puis corrigées. Certains textes UI/messages restent longs pour préserver leur rendu exact.

Les étapes réseau gardent cancel→GET frais→construction PATCH→écriture→cancel→cache. La préparation reste hors du catch de réconciliation. Verrous synchrones, WeakSets, retry false, mounted, erreurs connues/incertaines et absence de rendu optimiste restent identiques. La décision pure d'entrée dans la dernière colonne ne remplace pas les gardes de confirmation/mounted/kind du contrôleur.

## Vérifications

```powershell
npm run lint
npm run build
node --experimental-strip-types --test tests/*.test.mjs
git diff --check
```

Exécution Windows via npm.cmd et Git `-c safe.directory=C:/Users/hugoc/central-web-front`.

- Lint : succès sans avertissement.
- Build strict TypeScript/Vite : succès. JS 737,42 kB, gzip 216,62 kB ; avertissement de taille de bundle préexistant. CSS généré `index-BLbjMD2J.css` identique à celui du début de la passe.
- Tests : 12/12, dont les 7 Analytics existants et 5 ciblés sur tableau complet, confettis, conflits de tâche, dates et tri stable.
- Diff check : succès ; seuls avertissements de conversion LF→CRLF.
- Comparaison déterministe avec le code de départ sur 100 tableaux générés par module : résultats Analytics, mouvements clavier/dépôt et PATCH identiques. Ce contrôle temporaire n'ajoute pas de test couplé au code historique dans le dépôt.

## Chrome DevTools MCP

Backend disponible : GET /health = {ok:true}. GET réels retrouvent les six cartes, dix utilisateurs et collections de card-1, avec deux dates de commentaires et cinq tâches. Trois pages, deux thèmes et tailles desktop/mobile vérifiés sans débordement horizontal ; bascule manuelle claire puis retour automatique sombre après reload confirmé. Console finale sans error/warn.

Les écritures ont été entièrement simulées dans window.fetch, sans toucher PostgreSQL :

- Quatre flèches, positions 1 puis 0, aller/retour vers voisine ; focus conservé. Drag natif réordonne et nettoie les marqueurs.
- PUT retardé : carte dans la source et zéro confetti avant réponse ; une seule demande malgré une autre flèche ; dernière colonne confirmée puis 40 particules. Préférence réduite simulée : particules supprimées, transition carte 0s, animation modale none.
- Ajout/retrait de Maya conserve Alex ; retrait rend le focus à Membres. Commentaire publié sans date nouvelle envoyée ; historique et date précédente conservés.
- Ajout, cochage/décochage et renommage de tâche conservent les autres ; focus après confirmation sur Modifier. Échap ferme la fiche et rend le focus au bouton d'ouverture.
- Refus 400 : brouillon conservé et liste inchangée.
- Double soumission pendant PATCH retardé : un seul PATCH, contrôles désactivés et liste inchangée avant confirmation. Navigation vers Analytics pendant ce PATCH : aucune nouvelle lecture board (11 avant/après), actualisation désactivée ; cache mis à jour après confirmation malgré démontage du contrôleur.
- Réponse PATCH perdue après écriture : GET/PATCH/GET, pas de retry automatique, résultat relu et brouillon conservé.
- Lecture préparatoire refusée : commandes bloquées et reprise explicite réussie.
- Reload de fixture : tâches/commentaires/dates conservés, aucun confetti rejoué.

## README : vérifications factuelles

Scripts frontend, lockfile, variables import.meta.env, Vite et .gitignore consultés. Oxlint documenté, aucun npm test inventé. Versions du lock concordent avec npm ls. Dépôts frontend/API vérifiés via remotes et GitHub get_repo (publics).

Backend examiné en lecture seule : package.json, index.ts, migrate.ts et seed.ts. Le README distingue Docker/PostgreSQL et frontend, documente les variables sans leurs secrets et explique les migrations/horodatage/seed automatiques de npm run dev. Aucun démarrage, reset ou migration exécuté. Aucun .env privé lu.

## Revues

### Standards

Un constat initial sur la condition de restitution du focus a été corrigé : canRestoreFocus explicite, payloads et handlers lisibles. Revue finale : 0 constat restant.

### Spec

0 constat bloquant ou régression identifié. Coordination, contrats, focus, calculs et documentation conformes à la comparaison de départ. Résultats navigateur et outils ci-dessus complètent la revue statique.

## Choix volontairement conservés et limites

Pas de migration générale vers une architecture par fonctionnalités : API/types/hooks/pages et sous-dossiers actuels sont déjà cohérents. Les WeakSets et refs de coordination/focus restent en place ; pas de nouveau gestionnaire de state machine. Aucun hook universel de formulaire ou repository intermédiaire. useTheme, Confetti, routes, CSS et clés Query ne sont pas réécrits. Le module Analytics reste autonome.

Les tests navigateur sont sous Chrome. Les PUT/PATCH et leur persistance sont simulés pour respecter l'interdiction de modifier la base ; lectures API réelles vérifiées. Reduced-motion est simulé via MediaQueryList/règles CSS, pas par un réglage système natif. Les limites de concurrence GET→PATCH entre plusieurs clients et d'identification des tâches identiques restent celles du contrat API et sont documentées dans le README. Aucun backend/secrets/dépendance/commit/push modifié.
