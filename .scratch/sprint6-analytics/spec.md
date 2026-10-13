# Sprint 6 — Sprint Analytics & Team Workload

Status: ready-for-agent
Référence de départ : 1bb038408517867140c981af86e661e8ca2b1c7c (hugoc/sprint6).

## Critères d'acceptation

- CA1 : route /analytics et navigation active accessibles, sans régression des Sprints 3–5.
- CA2 : total des cartes uniques du tableau, nombre/répartition par colonne, nombre et pourcentage terminés.
- CA3 : progression globale pondérée par tâches de checklist (terminées / toutes les tâches).
- CA4 : tous les membres GET /users affichés, même sans carte ; cartes actives/terminées et progression checklist par membre.
- CA5 : visualisation de la répartition par colonne, de la completion et de la charge active/terminée ; identification factuelle des écarts.
- CA6 : règles explicites pour multi-assignment, absence d'assignation, checklist/tableau/utilisateurs vides et utilisateurs devenus indisponibles.
- CA7 : calculs TypeScript purs, entrées non modifiées, cas limites vérifiables.
- CA8 : mêmes clés TanStack Query/API ; états de chargement, erreur et reprise, pas de lecture conflictuelle pendant une écriture du tableau.
- CA9 : Chakra UI, thèmes clair/sombre, valeurs lisibles indépendamment de la couleur, responsive et contrastes vérifiés.
- CA10 : tests navigateur, lint, build, diff-check, revues Standards/Spec et documentation ; aucune écriture API/base, aucun secret lu, aucune dépendance ajoutée, aucun commit/push.

## Règles de calcul

- Chaque carte appartient à une colonne. Dernière colonne du tableau = terminée, conformément au domaine Sprint 4 ; toutes les autres = actives. Même règle avec une seule colonne. Sans colonne, zéro carte.
- Global : chaque carte comptée une fois. Répartition par colonne = nombre de cartes de cette colonne / total ; completion = cartes dans dernière colonne / total.
- Checklist : chaque tâche pèse une unité. Inclut cartes actives ET terminées. Pas de moyenne des pourcentages de carte. Aucune tâche = pourcentage non applicable, jamais 100 % inventé. Tableau vide : totaux zéro, pourcentages non applicables.
- Individuel : carte attribuée comptée une fois pour chaque ID membre distinct. Toutes ses tâches comptent dans la checklist de chacun. Les totaux membres ne doivent donc pas être additionnés pour obtenir le total du tableau.
- Sans assignation : carte dont assignees est vide ; compteur global explicite. ID absent de GET /users : reste une assignation, signalé séparément comme indisponible, pas traité comme une carte sans membre. Aucun membre fictif créé.
- Écarts : moyenne des cartes actives par utilisateur disponible (inclut les utilisateurs à zéro), min/max et différence max-min. Comparaison descriptive à cette moyenne ; aucune estimation d'effort, capacité, vélocité, délai ou historique. Cartes affectées uniquement à des IDs indisponibles exclues de cette moyenne, mais comptées globalement et signalées.
- Les calculs conservent la précision des ratios ; arrondi au dixième de pourcent à l'affichage français.

## Architecture

`src/analytics.ts` expose calculateSprintAnalytics(board, users) et les types du résultat. Aucun React, réseau, horloge ou mutation des entrées. `AnalyticsPage` lit les données via les clés existantes et compose les sections. `SprintOverview`, `TeamWorkload` et `MetricBar` présentent des valeurs textuelles avec barres Chakra, sans bibliothèque de graphiques ni animation. Les membres sont ordonnés par nombre de cartes actives décroissant, puis nom/ID pour un affichage stable.

La page est en lecture seule : GET board/users, rafraîchissement explicite et relecture à l'ouverture. `useIsMutating(boardWriteKey)` suspend les lectures/actions de rafraîchissement pendant un PUT/PATCH issu du tableau ; les écritures existantes annulent déjà les GET de cette clé et alimentent le cache uniquement après confirmation.

## Validation

Tests du contrat public de calcul avec Node intégré (sans dépendance) : exemple multi-assigné travaillé à la main, moyenne pondérée, tableaux/listes vides, ID inconnu, duplications d'assignation, immutabilité. Chrome DevTools : données réelles en lecture seule, réponses simulées pour cas limites/erreurs, navigation, thèmes, responsive et contrastes. Pas de données historiques inventées, aucune écriture backend.
