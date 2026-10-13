$implement .scratch/sprint4-card-movement/issues/08-precise-card-drop.md

Les tickets 06 et 07 du Sprint 4 sont terminés et validés.

Je souhaite maintenant implémenter uniquement le ticket 08 : déplacement et réorganisation des cartes par drag-and-drop.

Exigences fonctionnelles :

1. Permettre de réordonner les cartes dans une même colonne.
2. Permettre de déplacer une carte vers une colonne immédiatement voisine.
3. Interdire les déplacements directs vers une colonne non voisine.
4. Déterminer la position d'insertion avant ou après une carte selon la moitié survolée.
5. Afficher un indicateur visuel clair de la position où la carte sera déposée.
6. Permettre le dépôt à la fin d'une colonne et dans une colonne vide.
7. Calculer correctement les indices après retrait de la carte source, conformément au contrat API.
8. Ne pas envoyer de PUT pour un dépôt annulé, interdit ou sans effet.
9. Réutiliser la mutation persistante du ticket 06 : aucune mise à jour visuelle définitive avant confirmation serveur.
10. Bloquer les nouvelles mutations pendant une requête en cours.
11. Nettoyer les indicateurs de dépôt après succès, erreur ou annulation.
12. Préserver la sélection, le focus et toutes les commandes clavier implémentées au ticket 07.

Contraintes techniques :

- Examiner en priorité le code existant et la branche hugoc/sprint2 afin de réutiliser les mécanismes pertinents.
- Ne pas réimplémenter la couche API ni modifier le backend.
- Préserver le dark mode, le responsive et les comportements accessibles.
- Éviter toute nouvelle dépendance si les outils existants suffisent.
- Ne pas implémenter les confettis : ils appartiennent au ticket 09.
- Respecter AGENTS.md et archiver le prompt initial sans lire les anciens prompts.

Tests attendus :

- Réorganisation dans une colonne.
- Déplacement dans chacune des deux directions vers une colonne voisine.
- Dépôt avant, après et à la fin.
- Dépôt dans une colonne vide.
- Tentative de dépôt vers une colonne non voisine.
- Annulation et dépôt sans effet.
- Persistance après rechargement.
- Gestion des erreurs API et des requêtes retardées.
- Vérification des commandes clavier après implémentation.

Utilise Chrome DevTools MCP, puis exécute npm run lint, npm run build et git diff --check.

Les PUT de test sur la base de développement sont autorisés. Restaure autant que possible l'ordre initial des cartes après les tests.

Effectue les revues Standards et Spec.

Présente les fichiers modifiés, les critères validés, les tests effectués et les éventuelles limites.

Ne traite pas le ticket 09 et ne fais aucun commit ni push.

Réponds en français.
