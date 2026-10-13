$implement .scratch/sprint4-card-movement/issues/06-confirmed-card-movement.md

Le backend est maintenant opérationnel.

Vérifications effectuées :
- GET http://localhost:3000/health → {"ok":true}
- GET http://localhost:3000/boards/mini-trello → tableau Mini-Trello récupéré avec ses colonnes.
- PostgreSQL est démarré via Docker.
- L'API est accessible sur le port 3000.

Je t'autorise à implémenter le ticket 06 et à effectuer les tests d'intégration nécessaires sur le tableau de développement.

Objectifs :
1. Remplacer la lecture statique de board.json par GET /boards/mini-trello avec TanStack Query.
2. Réutiliser autant que possible les helpers et interactions de hugoc/sprint2.
3. Permettre la sélection des cartes et leur déplacement horizontal vers une colonne voisine.
4. Enregistrer les déplacements avec PUT /cards/:cardId.
5. Attendre la confirmation serveur avant de modifier le tableau affiché.
6. Conserver la réponse BoardData complète.
7. Gérer les erreurs réseau et désactiver les déplacements pendant une mutation.
8. Vérifier la persistance après rechargement.

Tu peux utiliser Chrome DevTools MCP pour tester les interactions et les requêtes réseau.

Tu es autorisé à effectuer des PUT de test sur cette base de développement. Ne lance aucun reset, migration supplémentaire ou suppression de données.

Ne modifie pas le backend et ne lis pas les secrets de .env.

Respecte AGENTS.md, les skills et la spécification Sprint 4.

Ne traite pas encore les tickets 07, 08 et 09.

À la fin :
- Exécute npm run lint, npm run build et git diff --check.
- Effectue une revue du code.
- Présente les critères validés et les éventuelles limitations.
- Ne crée pas encore de commit ni de push.

Réponds en français.
