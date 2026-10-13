Je souhaite maintenant réaliser une **passe finale de refactoring, de lisibilité et de documentation** de mon projet Mini-Trello.

Les Sprints 3 à 6 et la refonte visuelle Design V2 sont terminés. Je suis satisfait du rendu actuel.

**Objectif principal : rendre le code facilement compréhensible, maintenable et agréable à relire par un développeur humain, sans modifier le comportement de l'application.**

Tu peux effectuer directement le refactoring après ton audit, en prenant les précautions nécessaires.

## 1. Audit de l'existant

Commence par :
- Lire AGENTS.md et respecter ses conventions.
- Archiver ce prompt initial conformément aux instructions, sans lire les anciens prompts archivés.
- Examiner toute l'arborescence de `src/`.
- Identifier les composants volumineux, fonctions longues, JSX difficile à lire, fichiers mélangeant trop de responsabilités et duplications.
- Identifier les fonctions métier qui méritent d'être extraites.
- Examiner `package.json`, TypeScript, ESLint, les scripts de tests et les conventions déjà présentes.
- Examiner `README.md` et déterminer ce qui est obsolète, incomplet ou inexact.
- Vérifier l'état Git avant toute modification, sans effacer le travail existant.

Produis un court plan de refactoring avec les fichiers concernés, puis exécute-le progressivement.

## 2. Lisibilité du code

Je souhaite un code que je puisse lire et comprendre facilement.

Applique les principes suivants :
- Utiliser des noms explicites pour les variables, fonctions, paramètres et types.
- Éviter les lignes excessivement longues ; viser environ 100 caractères lorsque c'est raisonnable et compatible avec les conventions du projet.
- Mettre en forme le JSX pour que les props et la structure des composants soient facilement lisibles.
- Éviter les conditions imbriquées complexes et les ternaires difficiles à comprendre.
- Extraire les calculs ou conditions complexes dans des fonctions auxiliaires aux noms explicites.
- Découper les fonctions longues lorsqu'elles regroupent plusieurs responsabilités.
- Éviter les duplications inutiles.
- Conserver les fonctions simples dans leur contexte lorsqu'une extraction n'apporterait rien.
- Ajouter des commentaires courts uniquement pour expliquer une décision ou un comportement non évident.
- Préférer des fonctions pures pour les transformations de données et les calculs.
- Conserver un typage TypeScript strict ; ne pas utiliser `any` pour contourner des difficultés.

Je ne veux pas d'un découpage artificiel avec des dizaines de petits fichiers ou de fonctions inutiles.

## 3. Organisation des fichiers

Réorganise les fichiers lorsque cela améliore réellement la compréhension.

Sépare clairement, quand c'est pertinent :
- Accès à l'API.
- Types et contrats partagés.
- Logique métier.
- Hooks React.
- Composants de présentation.
- Pages et navigation.
- Calculs Analytics.
- Configuration visuelle et tokens Chakra.

Tu peux envisager une organisation par fonctionnalités (`board`, `card-details`, `analytics`) si elle apporte une amélioration concrète.

Ne déplace pas systématiquement tous les fichiers. Conserve les bons choix d'architecture existants.

Évite les dépendances circulaires, les abstractions prématurées et les couches intermédiaires inutiles.

## 4. Fichiers prioritaires

Accorde une attention particulière à :
- `useBoardController` : lisibilité, responsabilités et coordination des opérations.
- `card-editing.ts` : fonctions métier et intentions de modification.
- Composants `Board`, `Column` et `Card`.
- `CardDetails` et les sections membres, commentaires et checklist.
- Calculs et composants Analytics.
- Composants Header, Layout et HomePage.
- Configuration des thèmes clair/sombre.

Ces noms sont indicatifs : inspecte les vrais fichiers avant de décider des modifications.
Si un fichier est déjà clair, laisse-le tel quel.

## 5. Préservation du comportement

C'est une contrainte absolue.
Le refactoring ne doit pas introduire de changement fonctionnel.

Préserve intégralement :
- Le chargement du tableau via TanStack Query.
- Les déplacements clavier dans les quatre directions.
- Le drag-and-drop précis.
- La persistance des positions et des colonnes.
- Les confettis déclenchés uniquement après confirmation serveur.
- La gestion des erreurs API.
- Les membres et leurs associations.
- L'historique des commentaires et leurs dates.
- Les checklists et leurs modifications.
- Les opérations PATCH qui remplacent les collections ciblées.
- La coordination des écritures existante.
- Les calculs Analytics.
- La navigation et les routes.
- Le dark mode automatique et la bascule manuelle.
- Le responsive, le focus clavier et l'accessibilité.
- Le respect de `prefers-reduced-motion`.

Ne change pas les contrats API ni les données métier.
Ne modifie ni le backend ni PostgreSQL. Ne lance aucun reset ni migration.

## 6. README.md définitif

Réécris ou complète le README pour qu'il constitue une documentation finale professionnelle, précise et autonome.

Je souhaite les sections suivantes :
1. **Présentation** : objectif et description de Mini-Trello.
2. **Fonctionnalités** : Kanban, clavier, drag-and-drop, membres, commentaires, checklist, Analytics, thèmes.
3. **Stack technique** : versions et bibliothèques réellement utilisées.
4. **Prérequis** : Node.js, npm, backend, PostgreSQL et Docker si nécessaires.
5. **Installation** : commandes exactes pour installer les dépendances.
6. **Configuration** : variables d'environnement effectivement utilisées, sans exposer de secrets.
7. **Démarrage** : comment lancer le backend et le frontend.
8. **Architecture** : arborescence synthétique et responsabilités des principaux dossiers.
9. **API** : endpoints utilisés et comportement essentiel des mutations.
10. **Tests et qualité** : commandes réellement présentes dans package.json.
11. **Accessibilité** : raccourcis clavier, thèmes et animations réduites.
12. **Limites connues** : absence d'historique analytique et limites de concurrence du contrat API, si toujours pertinentes.

Ajoute les liens des dépôts GitHub pertinents lorsqu'ils sont vérifiés.

Vérifie chaque commande, chaque nom de variable et chaque affirmation en consultant le projet. Ne documente pas une fonctionnalité, un script ou une configuration qui n'existe pas.

Je souhaite un README rédigé en **français**, agréable à lire, avec des titres clairs, des exemples de commandes et sans contenu inutilement verbeux.

## 7. Méthode de travail

Procède par étapes :
1. Audit et plan.
2. Nettoyage de la lisibilité et du formatage.
3. Extraction des fonctions auxiliaires réellement utiles.
4. Réorganisation ciblée des fichiers et imports.
5. Tests et vérifications de non-régression.
6. Mise à jour du README selon l'architecture finale.
7. Revue globale.

Évite de combiner une réécriture majeure de la logique métier avec un simple déplacement de fichiers.
Si une extraction présente un risque fonctionnel disproportionné, conserve l'architecture actuelle et documente la décision.

## 8. Validation

Exécute :
- `npm run lint`
- `npm run build`
- Tous les tests existants, notamment les 7 tests Analytics.
- `git diff --check`

Ajoute quelques tests ciblés si une extraction de logique métier le justifie.

Avec Chrome DevTools MCP, effectue une vérification de non-régression des trois pages, des thèmes, des interactions principales et des formulaires.
Si des tests nécessitent un backend indisponible, indique explicitement ce qui n'a pas pu être vérifié.

Ne crée aucune nouvelle dépendance sans nécessité et justification.
Effectue les revues Standards et Spec.

## 9. Rapport final

Documente les travaux dans `.scratch/refactor-maintainability/`.

Présente :
- L'arborescence finale.
- Les fichiers créés, déplacés ou supprimés.
- Les fonctions auxiliaires extraites.
- Les améliorations de lisibilité.
- Les responsabilités des modules importants.
- Les vérifications effectuées.
- Les points volontairement laissés inchangés.
- Les éventuelles limites.

**Ne fais aucun commit ni push sans mon autorisation.**
Réponds en français.
