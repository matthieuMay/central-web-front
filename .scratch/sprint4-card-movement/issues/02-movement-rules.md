# Fixer les règles de déplacement et d'insertion

Type: grilling
Label: wayfinder:grilling
Mode: HITL
Status: resolved
Blocked by: None
Parent: [Préparer les déplacements persistants et leur célébration](../map.md)

## Question

Quelles règles exactes doivent partager clavier et drag-and-drop pour transformer une intention en colonne cible et indice après retrait ?

Les exigences déjà fournies fixent haut/bas comme réorganisation et gauche/droite comme colonne voisine ; aucun mouvement impossible aux limites. Préciser la position horizontale (fin recommandée), l'insertion avant/après la carte visée, le dépôt en fin/colonne vide, le rejet d'une colonne non voisine et le traitement d'un dépôt sans effet. Une voisine se définit par l'ordre des données, même lorsque la grille se replie.

Scénarios à discuter : déplacer B vers après C dans [A,B,C], déplacer la première carte vers le haut, entrer dans Review vide, déposer directement de Sprint backlog vers Done.

## Comments

Les règles seront confrontées aux consignes recueillies par [Retrouver les consignes et les sources de l'existant](01-sources-existing-work.md) avant finalisation de la spécification.

Recommandation horizontale/voisines soumise à l'utilisateur, sans décision prise à sa place.

## Answer

Résolu le 2026-10-09 sur validation explicite de l'utilisateur : gauche/droite = fin de colonne voisine ; haut/bas = une position vers le haut/bas dans la colonne actuelle ; DnD = colonne actuelle ou immédiatement voisine, dans l'ordre du tableau. Pas de mouvement hors limites, vers une colonne distante ou de requête pour un dépôt sans effet.

L'indice est calculé après retrait. Exemple [A,B,C], déplacer B après C => [A,C,B], position 2 ; avant A => [B,A,C], position 0. Une colonne vide reçoit position 0. Gauche/droite peut omettre position pour demander l'ajout en fin.

Pour rendre « position visée » vérifiable dans la spécification : proposer une zone avant/après chaque carte, déterminée par moitié supérieure/inférieure, et une zone de fin comprenant le vide de colonne. Il s'agit du détail d'interaction proposé pour to-spec, pas d'une nouvelle règle métier validée par l'utilisateur.

Réutiliser sélection/focus et handlers du Sprint 2 de manière ciblée, en conservant les surfaces du Sprint 3. La sélection historique par clic/Entrée/Espace et désélection Échap est conservée comme point de départ ; les flèches ne doivent pas agir depuis un champ ou une autre commande.
