$implement .scratch/sprint4-card-movement/issues/09-confirmed-confetti-validation.md

Le ticket 08 a été terminé et validé avant l'extinction de mon ordinateur. Son rapport de validation est disponible dans .scratch/sprint4-card-movement/validation-08.md.

Les tickets 06, 07 et 08 sont désormais terminés.

Je souhaite implémenter uniquement le ticket 09, conformément à la spécification existante.

Réutilise le code déjà présent et respecte les règles du professeur concernant les confettis :
- Déclenchement uniquement après confirmation API d'un déplacement depuis une autre colonne vers la dernière colonne.
- Aucun déclenchement avant confirmation, après un échec, une réorganisation interne ou un rechargement.
- Respect de prefers-reduced-motion, y compris pendant une animation active.

Effectue ensuite la validation globale CA1 à CA15 avec Chrome DevTools MCP, les vérifications du responsive, du dark mode, des interactions clavier et du drag-and-drop.

Vérifie également les limites non testées lors des tickets précédents dans la mesure du possible.

Si le backend ou Docker sont arrêtés, signale-le avant les tests nécessitant ces services. Ne réinitialise aucune base de données.

Exécute npm run lint, npm run build et git diff --check, puis réalise les revues Standards et Spec.

Ne fais aucun commit ni push sans mon autorisation.

Réponds en français.
