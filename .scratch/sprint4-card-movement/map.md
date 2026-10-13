# Préparer les déplacements persistants et leur célébration — Sprint 4

Label: wayfinder:map

## Destination

Préparer le passage à une spécification du Sprint 4 prête à implémenter, fondée sur les consignes du professeur et le backend existant, accompagnée des corrections ciblées et des critères de validation. Les cinq décisions sont cadrées après les réponses utilisateur du 2026-10-09 ; la rédaction to-spec et l'implémentation restent des étapes distinctes.

## Notes

- Demande du 2026-10-09 : clavier gauche/droite vers une voisine, haut/bas dans la colonne, respect des limites, drag-and-drop avec insertion précise et colonne vide, persistance, confettis après arrivée confirmée dans la dernière colonne, prefers-reduced-motion.
- Contrat donné : `PUT /cards/:cardId`, corps `{ "column": "doing", "position": 1 }`, réponse `BoardData`. Indice après retrait ; omission de position = ajout à la fin. Aucun contrat de lecture supplémentaire n'est supposé.
- Consulter `wayfinder`, `grilling` et `domain-modeling` pour les décisions. `research` seulement lorsqu'une source externe précise est identifiée ; `prototype` seulement si une ambiguïté nécessite un essai accepté. Pour l'implémentation ultérieure autorisée : `tdd` aux points de test convenus et `code-review`.
- Réutiliser les composants et dépendances existants, conserver les acquis du Sprint 3, privilégier les changements ciblés.
- Aucune modification applicative, installation, mutation du backend, commit ou push pendant cette phase.
- Tracker local : enfants dans `issues/`, types de décision distincts des statuts de triage ; dépendances exprimées par `Blocked by`. Tracé initial sans résolution, puis cinq tickets revendiqués et résolus séquentiellement à la demande explicite de reprise et de résolution des questions possibles.
- État des lieux établi sur `hugoc/sprint4`, HEAD `051d590` : [inspection du checkout](etat-des-lieux.md). Les faits d'inspection ne constituent pas une décision validée par l'utilisateur.
- Vocabulaire du domaine : [CONTEXT.md](../../CONTEXT.md).
- Sources complétées : backend local et ref locale origin/main `9ab0b4a`, branche frontend `hugoc/sprint2` `5387444`. [Contrats réels](backend-contracts.md) et [éléments réutilisables](sprint2-reuse.md).
- Aucun secret .env lu, aucun changement backend, démarrage, migration, merge ou cherry-pick. Dev/start API appelle prepare(db), donc exige une autorisation spécifique avant exécution.

## Decisions so far

- [Retrouver les consignes et les sources de l'existant](issues/01-sources-existing-work.md) : consignes reçues, GET/PUT réels et version Sprint 2 identifiés ; démarrage API potentiellement mutatif.
- [Fixer les règles de déplacement et d'insertion](issues/02-movement-rules.md) : voisines et positions après retrait, gauche/droite en fin, haut/bas interne ; détail de ciblage à formaliser dans to-spec.
- [Définir la confirmation, les erreurs et les déplacements rapprochés](issues/03-confirmation-failures.md) : une mutation, tableau confirmé TanStack Query, erreurs et résultats réseau incertains traités sans confirmation fictive.
- [Définir la célébration d'une arrivée confirmée et la réduction des mouvements](issues/04-confirmed-celebration.md) : événement de succès éligible unique, aucun confetti sous reduced-motion ni sur simple lecture.
- [Arrêter les points de test et les preuves d'acceptation du Sprint](issues/05-validation-seams.md) : matrice navigateur/HTTP/persistance et non-régression prête à intégrer à la spécification ; tests de la future implémentation non exécutés.

## Not yet specified

Aucune incertitude de cadrage bloquante restante. Les détails proposés de ciblage de position, focus et annonces seront rendus vérifiables puis soumis à validation dans to-spec. La configuration active/disponibilité de l'API et de PostgreSQL est une vérification opérationnelle ultérieure, pas un endpoint à inventer ; aucun démarrage/migration n'est autorisé implicitement.

## Out of scope

Implémentation avant autorisation ; nouveau contrat API inventé ; refonte complète du tableau ; nouvelle fonctionnalité métier sans lien avec les déplacements ; correction générale des avertissements sans rapport avec l'intégration de Confetti.
