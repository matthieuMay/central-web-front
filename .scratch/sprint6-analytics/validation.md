# Sprint 6 — compte rendu de validation

Date : 13 octobre 2026. Branche : hugoc/sprint6. Base : `1bb038408517867140c981af86e661e8ca2b1c7c`. Aucun commit ni push.

## Livraison et architecture

- `src/App.tsx` : route `/analytics` dans le Layout existant.
- `src/components/Header.tsx` : lien Analytics et navigation pouvant se répartir sur plusieurs lignes.
- `src/analytics.ts` : contrat public pur `calculateSprintAnalytics(board, users)`, résultats typés, aucun effet de bord ; progression sans dénominateur = null.
- `src/pages/AnalyticsPage.tsx` : GET existants, clés de cache partagées board/users, erreurs/chargement/reprise et verrou de lecture pendant une écriture du tableau.
- `src/components/analytics/SprintOverview.tsx` : totaux et barres de répartition/completion/checklist.
- `src/components/analytics/TeamWorkload.tsx` : utilisateurs, barres actives/terminées sur une échelle commune, progression et comparaison descriptive des charges.
- `src/components/analytics/MetricBar.tsx` : barres statiques Chakra avec équivalent textuel complet ; graphiques décoratifs exclus de l'arbre accessible.
- `src/components/analytics/format.ts` : formatage français et arrondi d'affichage au dixième.
- `tests/analytics.test.mjs` : sept tests avec Node intégré, aucune dépendance supplémentaire.
- `.scratch/sprint6-analytics/spec.md` : règles de calcul, critères et choix. Ce fichier : résultats et limites.
- `prompts/20261013T142821Z-implement_sprint_6.md` : prompt initial archivé ; aucun ancien prompt lu.

Les collections, mutations, composants clavier/DnD/confettis et la couche API existants ne sont pas modifiés. Pas de graphique historique : l'API ne fournit qu'un instantané. Une visualisation en barres suffit pour comparer les données sans ajouter une bibliothèque.

## Critères et preuves

| Critère | Résultat |
| --- | --- |
| CA1 | Route directe, lien actif Analytics, aller-retour Tableau/Accueil/Analytics vérifiés dans Chrome. |
| CA2 | Données réelles : 6 cartes ; colonnes 1/2/1/2 ; 2 terminées = 33,3 %. Les valeurs des barres correspondent aux comptes. |
| CA3 | Données réelles : 2 tâches terminées sur 7 = 28,6 %. Exemple travaillé : 4 sur 8 = 50 %, pas une moyenne des pourcentages par carte. |
| CA4 | 10 utilisateurs réels affichés, y compris les personnes à zéro. Exemple simulé : Alex 2 actives/0 terminée, checklist 1/2 ; Maya 1 active/1 terminée, checklist 3/4 ; Noah zéro et aucune tâche. |
| CA5 | Barres par colonne, cartes terminées, checklists et charge individuelle. Exemple simulé : moyenne active 1, min 0, max 2, écart 2 ; Alex explicitement au-dessus de la moyenne. Aucun indicateur d'effort/capacité inventé. |
| CA6 | Chrome : tableau sans colonnes, liste d'utilisateurs vide, carte sans assignation, membre indisponible, multi-assignation et checklist vide. Zéro reste zéro ; pourcentage non applicable ; aucun membre fictif. |
| CA7 | Sept tests de calcul passent, avec valeurs attendues indépendantes, déduplication des assignees et entrées récursivement gelées. Tableau sans cartes et tableau à une seule colonne couverts. |
| CA8 | GET board/users réels, actualisation manuelle, chargement retardé et erreurs simulées séparées. Erreur utilisateurs ne masque pas l'overview. Reprise du tableau/utilisateurs validée. Erreur après succès garde le cache avec avertissement explicite de données potentiellement anciennes. |
| CA9 | Thèmes clair/sombre vérifiés. À 375/768/1440 px : largeur du document 360/753/1425 px, sans débordement horizontal. Ratios minimaux des textes mesurés : 7,41:1 clair, 7,37:1 sombre. Les nombres et labels portent le sens indépendamment de la couleur. |
| CA10 | Contrôles et revues réussis, documentation enregistrée. Aucun changement de backend/base, aucune migration/reset, aucun secret lu, aucune dépendance, aucun commit/push. |

## Non-régression et cache

Tests sur fixture navigateur isolée : Entrée sélectionne, les quatre flèches déplacent/réordonnent avec les positions attendues et maintiennent le focus ; drag natif réordonne ; une entrée confirmée dans la dernière colonne affiche 40 particules. Échap ferme la fiche. Un PATCH de checklist retardé reste non optimiste.

Pendant ce PATCH, navigation vers Analytics : bouton Actualiser désactivé, message de dernier état confirmé, compteur de GET tableau inchangé (3 avant/après navigation). Progression à 4/8 jusqu'à confirmation ; puis 3/8 et bouton disponible après la réponse CardData. Un seul PATCH simulé. Ces PUT/PATCH sont entièrement interceptés dans Chrome et n'atteignent jamais le backend ; aucune donnée PostgreSQL modifiée.

Retour aux données réelles : les 6 cartes sont présentes ; card-1 conserve Daniel, ses 2 commentaires avec dates `2026-10-13T14:06:06.530Z` / `2026-10-13T14:06:06.965Z` et ses 5 tâches. Navigation vers Accueil puis Analytics et rafraîchissement réel réussissent. Le réseau observé sur cette séquence ne contient que des GET ; console finale sans error/warn. Les GET annulés pendant le double montage de développement React ne sont pas des écritures.

## Commandes exécutées

```powershell
node --experimental-strip-types --test tests/analytics.test.mjs
npm run lint
npm run build
git diff --check
```

Sous PowerShell, npm exécuté via `npm.cmd`. Git exécuté avec `-c safe.directory=C:/Users/hugoc/central-web-front` pour l'utilisateur sandbox.

- Tests : 7 réussis, 0 échec.
- Lint : succès sans avertissement, après séparation des fonctions de formatage pour Fast Refresh.
- Build TypeScript/Vite : succès ; bundle JS 709,05 kB, gzip 207,37 kB. Avertissement Vite de taille >500 kB déjà présent avant Sprint 6.
- Diff check : succès sans erreur de whitespace.

## Standards

Revue indépendante du diff et des nouveaux fichiers : aucun constat. Les responsabilités calcul/lecture/présentation sont distinctes et respectent AGENTS.md, CONTEXT.md et docs/agents. Aucun smell Fowler étayé.

## Spec

Revue indépendante : aucun écart fonctionnel ni dépassement de périmètre identifié. Les vérifications navigateur et outils demandées, restées en attente au moment de la revue, sont consignées ci-dessus.

## Limites

- Instantané actualisé à l'ouverture ou avec Actualiser ; pas de polling, de temps réel multi-client ni d'historique fourni par l'API.
- La charge est un nombre de cartes actives attribuées, sans estimation du temps ou de la complexité. Les cartes multi-assignées et leurs tâches participent à chaque membre ; les totaux membres ne doivent pas être additionnés pour retrouver le total global.
- Statut terminé défini par la dernière colonne, y compris pour un tableau à une seule colonne.
- Validation navigateur sous Chrome. Les erreurs et écritures de non-régression ont été simulées pour respecter l'interdiction de modifier la base ; pas de nouvelle validation PUT/PATCH réelle dans ce sprint.
- Les contrastes mesurés couvrent les textes calculés dans les deux thèmes ; cette vérification ne constitue pas un audit complet d'accessibilité multi-navigateur.
