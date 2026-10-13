$wayfinder

Je commence le Sprint 4 de mon projet Mini-Trello.

Je souhaite respecter les consignes du professeur et utiliser les skills Matt Pocock lorsque c'est pertinent.

Objectif : permettre le déplacement des cartes au clavier et par drag-and-drop, avec une animation de confettis lors de leur arrivée confirmée dans la dernière colonne.

Comportements attendus :
- Flèches gauche/droite : déplacement vers une colonne voisine.
- Flèches haut/bas : réorganisation dans la même colonne.
- Aucun mouvement impossible aux limites.
- Drag-and-drop dans une colonne ou vers une colonne voisine, avec insertion à la position visée.
- Dépôt possible dans une colonne vide.
- Persistance des déplacements après rechargement.
- Confettis uniquement après confirmation du déplacement vers la dernière colonne.
- Respect de prefers-reduced-motion.

Contrat API :
PUT /cards/:cardId
Body : {"column":"doing","position":1}
Réponse : BoardData.
La position est un indice basé sur zéro après retrait de la carte. Sans position, la carte est ajoutée à la fin.

IMPORTANT :

1. Examine d'abord le code existant. Le projet contient déjà des fonctionnalités de drag-and-drop et un composant Confetti.tsx.
2. Identifie ce qui fonctionne déjà, ce qui manque et ce qui doit être corrigé.
3. Vérifie la couche de données et l'intégration éventuelle du backend. N'invente pas de contrat API supplémentaire.
4. Consulte AGENTS.md, CONTEXT.md et la documentation pertinente, sans lire les anciens prompts archivés.
5. Respecte les conventions de stockage des prompts et tickets.
6. Utilise wayfinder pour identifier les incertitudes, dépendances et décisions nécessaires.
7. Privilégie les modifications ciblées plutôt qu'une réécriture complète.

Présente-moi un état des lieux précis et propose les prochaines étapes.

Ne modifie pas encore le code applicatif. Ne commence pas l'implémentation sans mon autorisation.

Réponds en français.
