# Prompt — mode sombre piloté par le système

Implémente un mode sombre clair/sombre pour l’application web avec les exigences suivantes :

## Comportement attendu

- Détecter la préférence du système avec `window.matchMedia('(prefers-color-scheme: dark)')`.
- Au premier chargement de la page, appliquer automatiquement le thème correspondant à la préférence système.
- Ajouter dans le header un bouton bascule accessible permettant de passer manuellement du thème clair au thème sombre et inversement.
- Le bouton doit indiquer clairement l’action ou l’état courant, être utilisable au clavier et exposer un nom accessible (`aria-label` ou équivalent).
- La bascule manuelle ne doit être valable que pour la session ou l’état courant de la page : ne rien enregistrer dans `localStorage`, `sessionStorage`, les cookies ou un autre mécanisme de persistance.
- Après un rechargement complet de la page, ne pas restaurer le dernier choix manuel : revenir à la préférence actuelle du système.
- Si la préférence système change pendant que la page est ouverte, suivre cette préférence uniquement si l’utilisateur n’a pas effectué de bascule manuelle depuis le chargement. Après une bascule manuelle, conserver le choix manuel jusqu’au rechargement.
- Respecter les conventions, composants, styles, système de thème et mécanismes d’état déjà présents dans le projet. Ne pas introduire de dépendance inutile.

## Contraintes d’implémentation

- Centraliser la logique de détection et de changement de thème dans le mécanisme approprié au projet.
- Éviter tout flash visible du mauvais thème au chargement si l’architecture existante permet de l’éviter.
- Préserver le rendu et le comportement existants des autres composants.
- Utiliser les tokens ou variables de couleur existants lorsqu’ils sont disponibles.
- Gérer proprement les environnements où `window` ou `matchMedia` n’est pas disponible, notamment pendant le rendu côté serveur ou les tests.

## Tests à ajouter ou mettre à jour

Vérifie au minimum les scénarios suivants :

1. Une préférence système sombre applique le thème sombre au chargement.
2. Une préférence système claire applique le thème clair au chargement.
3. Le bouton du header inverse le thème courant.
4. Le bouton expose un nom accessible et fonctionne au clavier.
5. Aucun thème sélectionné manuellement n’est écrit dans `localStorage`, `sessionStorage` ou les cookies.
6. Après un rechargement simulé, le thème revient à la préférence système et non au dernier choix manuel.
7. Un changement de préférence système est pris en compte tant que l’utilisateur n’a pas basculé manuellement.
8. Après une bascule manuelle, un changement de préférence système ne remplace pas le choix courant avant le rechargement.

À la fin, exécute les tests et le lint/type-check pertinents, puis résume les fichiers modifiés et les vérifications effectuées.
