$implement .scratch/sprint4-card-movement/issues/07-keyboard-card-ordering.md

Le ticket 06 est terminé et validé. Je souhaite maintenant implémenter uniquement le ticket 07 du Sprint 4.

Objectif : permettre la réorganisation persistante des cartes au clavier, avec une gestion correcte de la sélection et du focus.

Exigences :

1. Réutiliser l'architecture et les mécanismes de persistance du ticket 06.
2. Conserver les déplacements gauche/droite déjà fonctionnels.
3. Ajouter ArrowUp et ArrowDown pour déplacer une carte d'un rang dans sa colonne.
4. Respecter le calcul de position après retrait de la carte, conformément au contrat PUT /cards/:cardId.
5. Empêcher les déplacements impossibles : première carte vers le haut, dernière vers le bas, colonne à une seule carte.
6. Ne pas envoyer de PUT pour un mouvement sans effet.
7. Préserver l'accessibilité :
   - Navigation au clavier.
   - Sélection par Entrée/Espace.
   - Désélection par Échap.
   - Focus visible et cohérent après confirmation ou erreur.
   - Ne pas intercepter les touches des champs et contrôles interactifs internes.
8. Bloquer les nouvelles demandes de déplacement pendant une mutation réseau.
9. Ne jamais afficher un déplacement non confirmé comme enregistré.
10. Vérifier la persistance après rechargement.

Contraintes :
- Ne réimplémente pas la couche API existante.
- Réutilise les helpers et composants existants.
- Préserve le dark mode et le responsive.
- Ne modifie pas le backend.
- Ne lance aucune migration ou réinitialisation PostgreSQL.
- Les PUT de test sur le tableau de développement sont autorisés.
- Ne traite pas les tickets 08 et 09.
- Respecte AGENTS.md et archive le prompt initial sans lire les anciens prompts.

Vérifications :
- Tester les quatre flèches avec Chrome DevTools MCP.
- Vérifier les cas limites et le focus.
- Vérifier les requêtes et la persistance.
- Restaurer autant que possible l'ordre initial après les tests.
- Exécuter npm run lint, npm run build et git diff --check.
- Effectuer les revues Standards et Spec.

À la fin, présente les changements, les critères validés, les tests réalisés et les éventuels problèmes.

Ne fais aucun commit ni push.

Réponds en français.
