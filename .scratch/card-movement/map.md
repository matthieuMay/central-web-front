## Destination

Produire un prompt de spécification prêt à transmettre à un agent de codage pour déplacer une carte au clavier et en drag-and-drop, avec persistance via l'API existante et feedback utilisateur cohérent.

## Notes

Domaine Mini-Trello : tableau composé de colonnes et de cartes ordonnées. Le prompt doit couvrir l'accessibilité clavier, React DnD, les déplacements intra/inter-colonnes, les limites, les colonnes vides, la persistance et les confettis. Ne pas implémenter dans cette étape.

## Decisions so far

## Not yet specified

- Le composant exact qui possède l'état du tableau et la méthode de mise à jour devra être confirmé avant codage.
- Les détails visuels de l'indication de focus, du marqueur de drop et de l'animation des confettis restent à choisir pendant l'implémentation.
- La stratégie précise de rollback/notification d'erreur devra suivre les conventions existantes du dépôt.

## Out of scope

- Support tactile/mobile spécifique.
- Modification du contrat API au-delà de `PUT /cards/:cardId`.
- Fonctionnalités de déplacement en masse ou multi-sélection.
