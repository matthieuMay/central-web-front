# Définir la célébration d'une arrivée confirmée et la réduction des mouvements

Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: resolved
Blocked by: 03
Parent: [Préparer les déplacements persistants et leur célébration](../map.md)

## Question

Prérequis : [Définir la confirmation, les erreurs et les déplacements rapprochés](03-confirmation-failures.md).

Quel événement déclenche une seule célébration, et que doit percevoir l'utilisateur quand les mouvements sont réduits ?

Les confettis doivent suivre la confirmation, jamais une simple intention/drop. Proposition à valider : transition confirmée depuis une autre colonne vers la dernière dans l'ordre du tableau ; aucune célébration pour chargement, réorganisation interne, échec, dépôt sans effet ou réponse dupliquée.

Réutiliser Confetti en clarifiant son déclencheur (`particleCount` génère toujours 40 particules), son conteneur et son nettoyage. Proposition reduced-motion : supprimer les confettis, garder la confirmation accessible ; préciser aussi un changement de préférence pendant une animation et les arrivées successives.

## Answer

Résolu le 2026-10-09 sur validations utilisateur : célébrer uniquement après réponse API confirmant l'arrivée depuis une autre colonne dans la dernière colonne ; aucun confetti sous prefers-reduced-motion.

Identifier la dernière colonne par l'ordre du BoardData, sans coder l'identifiant done en dur. Comparer source confirmée avant la requête et destination dans le BoardData de réponse. Une mutation réussie éligible produit un événement de célébration, pas un effet déclenché par chaque lecture du tableau.

Exclusions : refus, perte réseau sans réponse confirmée, chargement/rechargement, réorganisation dans la dernière colonne, dépôt sans effet, lecture de réconciliation, déplacement hors limites et événement déjà traité. Une nouvelle entrée réelle depuis une autre colonne peut être célébrée de nouveau.

Adapter le Confetti existant de manière ciblée : déclencheur explicite plutôt que nom trompeur particleCount, conteneur décoratif qui ne bloque pas les interactions, nettoyage et génération stable des formes. Sous reduced-motion, ne pas générer/lancer les particules ; si la préférence devient active pendant l'animation, l'arrêter, sans rejouer un événement passé lorsqu'elle est désactivée. Conserver l'annonce accessible du succès sans dépendre de l'animation.

Les adaptations de Confetti sont maintenant dans le périmètre Sprint 4 ; elles ne justifient pas une correction générale sans rapport avec l'objectif.
