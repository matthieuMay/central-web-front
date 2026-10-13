Je souhaite implémenter mon Sprint 6 libre : **Sprint Analytics & Team Workload**.

L'objectif est de combiner deux fonctionnalités : un dashboard global de suivi du sprint et une analyse de la charge de travail par membre.

Crée une page `/analytics`, intégrée à la navigation existante.

Fonctionnalités attendues :

**1. Sprint Overview**
- Nombre total de cartes.
- Nombre de cartes par colonne.
- Nombre et pourcentage de cartes terminées.
- Progression globale des éléments de checklist.
- Graphiques de répartition des cartes.

**2. Team Workload**
- Liste des membres disponibles via GET /users.
- Nombre de cartes attribuées à chaque membre.
- Distinction entre cartes actives et terminées.
- Progression des checklists pour chaque membre.
- Visualisation de la charge de travail et identification des déséquilibres.

Contraintes :
- Réutiliser les données existantes du tableau et TanStack Query.
- Ne pas modifier le backend ni la base PostgreSQL.
- Définir clairement les règles de calcul des statistiques.
- Gérer les cartes multi-assignées, sans assignation, les checklists vides et les tableaux vides.
- Ne pas inventer de données historiques ou d'indicateurs impossibles à calculer depuis l'API.
- Créer des fonctions TypeScript pures et testables pour les calculs.
- Réutiliser Chakra UI et respecter les thèmes clair/sombre.
- Préserver les fonctionnalités existantes des Sprints 3, 4 et 5.
- Éviter toute nouvelle dépendance inutile.
- Respecter AGENTS.md et archiver le prompt initial sans lire les prompts existants.

Tu peux concevoir et implémenter cette fonctionnalité directement après un audit de l'architecture existante.

Vérifie la page dans Chrome DevTools MCP, les cas limites, la navigation, le responsive et les contrastes.

Exécute npm run lint, npm run build et git diff --check, puis effectue les revues Standards et Spec.

Documente les choix et les résultats dans .scratch/sprint6-analytics/.

Ne fais aucun commit ni push sans mon autorisation.

Réponds en français.
