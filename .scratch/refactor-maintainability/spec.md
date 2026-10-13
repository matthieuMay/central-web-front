# Passe finale de maintenabilité

Status: ready-for-agent

## Critères

- R1 : audit complet src/config/tests/README et prompt initial archivé sans lire les anciens.
- R2 : lisibilité JSX/props/types/conditions, noms explicites et lignes proches de 100 caractères.
- R3 : extractions utiles uniquement, fonctions pures testées, pas de déplacement systématique ni dépendance nouvelle.
- R4 : ordre des opérations, verrou PUT/PATCH, fraîcheur, confirmation, réconciliation/incertitude et confettis strictement conservés.
- R5 : cartes, formulaire/focus, quatre flèches, DnD, dates/collections, Analytics, routes/thèmes/responsive inchangés.
- R6 : README français autonome avec les douze sections demandées, commandes/variables/versions/liens vérifiés, effets du démarrage backend explicités.
- R7 : lint/build/tous les tests/diff-check, non-régression Chrome et revues Standards/Spec ; limites documentées.
- R8 : aucun backend/PostgreSQL/secret/reset/migration/commit/push, changements préexistants préservés.

## Audit et plan retenu

HEAD 1bb038408517867140c981af86e661e8ca2b1c7c, Sprint 6 et Design V2 non commités. Comparaison de cette passe contre `C:/Users/hugoc/AppData/Local/Temp/refactor-baseline-20261013T170110Z` (src, README, package et tsconfig.app), sans toucher ces travaux.

README encore Sprint 1 statique, donc réécriture complète vérifiée contre code et scripts. Oxlint utilisé, aucun ESLint configuré. Node >=22.22.0 ; tests Node en MJS existants, pas de npm test. TypeScript strict non activé : activation et correction de types uniquement.

Conserver dossiers API/types/hooks/pages/components/visual/analytics/card-details. Ajouter un petit module pur board-state pour recherche/merge/décision de célébration, et isoler ChecklistTask pour l'édition/focus d'une tâche. Ne pas remplacer le mécanisme de coordination réseau ni déplacer tous les fichiers métier. Clarifier le hook avec étapes nommées et sans IIFE/ternaire imbriqué. Extraire les conditions de présentation Analytics et le tri chronologique au plus près de leur contexte.

Le style et les valeurs des tokens, les expressions de layout, les délais et la structure DOM doivent rester identiques. Exceptions de longueur acceptées pour textes UI/messages si les découper modifiait les espaces affichés.
