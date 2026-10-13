Je souhaite réaliser une **refonte UI/UX complète de Mini-Trello**, afin de lui donner l'apparence d'une application SaaS moderne, soignée et conviviale, inspirée de Trello.

Toutes les décisions de direction artistique ont été validées. Tu peux concevoir et implémenter directement le nouveau design, en respectant les contraintes ci-dessous.

## 1. Audit préalable

Avant toute modification :
- Lire AGENTS.md et la documentation pertinente du projet.
- Examiner les composants React, le système de thème Chakra UI et les styles existants.
- Comprendre les pages `/`, `/board` et `/analytics`.
- Identifier les composants de détails des cartes.
- Examiner les modifications Git existantes pour ne rien écraser.
- Archiver ce prompt initial conformément à AGENTS.md, sans lire les prompts précédemment archivés.

Présenter brièvement les composants à modifier et l'architecture visuelle proposée, puis poursuivre l'implémentation si aucun point bloquant n'existe.

## 2. Identité visuelle

Style recherché : **Trello moderne, coloré, convivial, lumineux et très aéré**.

Palette principale :
- Turquoise : `#0D9488`
- Violet : `#7C3AED`
- Bleu ciel : `#38BDF8`
- Lavande : `#C4B5FD`

Utiliser une palette cohérente avec les deux thèmes.

Mode clair :
- Arrière-plan général gris très clair, proche de `#F4F6FA`.
- Cartes principalement blanches.
- Surfaces et colonnes colorées avec des teintes pastel.
- Textes sombres et contrastés.
- Ombres légères, bordures fines et arrondis généreux.

Mode sombre :
- Conserver la même identité turquoise/violet.
- Utiliser des surfaces sombres adaptées.
- Éviter les couleurs saturées utilisées comme grandes surfaces.
- Garantir la lisibilité des textes, contrôles et indicateurs.

Privilégier les tokens sémantiques Chakra UI et éviter les couleurs codées en dur lorsque le thème doit les adapter.

## 3. Navigation

Conserver une barre horizontale en haut.
Elle doit inclure :
- Le nom et éventuellement un pictogramme Mini-Trello.
- Les liens Accueil, Tableau et Analytics.
- Un indicateur clair de la page active.
- Le bouton de changement de thème existant.

Rendre le Header moderne, équilibré, avec de bons espacements et des états hover/focus soignés.
La navigation doit rester adaptée aux petits écrans.

## 4. Tableau Kanban

Créer un tableau visuellement aéré, avec des colonnes généreuses et différenciées.
Utiliser une identité colorée pour chaque colonne :
- Backlog : bleu ciel.
- Doing : violet.
- Review : orange doux.
- Done : turquoise/vert.

Les couleurs doivent être cohérentes avec la palette générale et adaptées au mode sombre.

Chaque colonne doit avoir :
- Un fond coloré subtil.
- Un titre clairement visible.
- Un compteur de cartes.
- Des espacements confortables.
- Des arrondis et bordures cohérents.
- Un état visuel soigné lorsqu'elle est vide.

Préserver les dispositions responsive existantes et éviter tout débordement horizontal involontaire.

## 5. Cartes enrichies

Je souhaite des cartes visuellement généreuses, contenant les informations utiles sans avoir besoin de les ouvrir.
Afficher, lorsque les données existent :
- Titre.
- Description courte, éventuellement tronquée.
- Avancement des éléments de checklist.
- Nombre de commentaires.
- Membres associés sous forme d'avatars ou d'initiales.
- Indicateurs visuels utiles et compréhensibles.

Ne pas inventer de champs qui n'existent pas dans l'API.
Utiliser :
- Fond blanc en mode clair.
- Bordures discrètes.
- Ombre légère.
- Arrondis généreux.
- Espacement confortable.
- Hover avec légère élévation ou changement de bordure.
- Focus clavier très visible.

Préserver le drag-and-drop et les indicateurs d'insertion, ainsi que les déplacements au clavier.

## 6. Fenêtre de détails des cartes

Je souhaite une **grande fenêtre modale centrale**, inspirée des détails de cartes Trello.
Cette fenêtre doit proposer une organisation claire des informations :
- Titre et description de la carte.
- Section Membres.
- Section Checklist.
- Section Commentaires.

Utiliser des sections visuellement distinctes avec une hiérarchie typographique cohérente.
La fenêtre doit être suffisamment large sur desktop et adaptée aux écrans mobiles.

Conserver :
- Tous les formulaires existants.
- La persistance des modifications.
- Les messages d'erreur.
- La gestion du focus et la navigation clavier.
- Le comportement de fermeture et de retour au focus initial.

Réutiliser les composants Chakra UI appropriés.

## 7. Dashboard Analytics

Je souhaite un dashboard **coloré, visuel et convivial**.
Améliorer :
- Les cartes KPI.
- Les graphiques de répartition par colonne.
- Les barres de progression.
- Les statistiques de checklists.
- La répartition de charge des membres.
- Les avatars et indicateurs d'activité.

Utiliser des cartes statistiques généreuses, des couleurs cohérentes, des espacements confortables et une hiérarchie visuelle claire.
Préserver l'exactitude des calculs TypeScript existants.
Ne pas ajouter de statistiques fictives ni modifier les règles métier.

## 8. Page d'accueil

Harmoniser la page d'accueil avec la nouvelle identité visuelle.
Créer une présentation accueillante, lisible et moderne, avec un titre bien hiérarchisé et des accès visibles au Tableau et à Analytics.
Conserver les routes et leurs comportements.

## 9. Animations

Je souhaite des animations **douces et discrètes**.
Exemples :
- Transitions courtes au survol.
- Léger changement d'élévation des cartes.
- Apparition douce des fenêtres modales.
- Transitions visuelles du thème lorsque cela est compatible avec les préférences utilisateur.

Éviter les animations excessives, rebonds importants ou effets permanents.
Respecter `prefers-reduced-motion`.
Ne pas modifier la logique métier des confettis existants.

## 10. Contraintes techniques

- React 19, TypeScript et Chakra UI existants.
- Conserver TanStack Query.
- Ne pas modifier le backend ni PostgreSQL.
- Ne pas modifier les contrats API.
- Ne pas installer de dépendances inutiles.
- Ne pas réécrire les contrôleurs métier.
- Ne pas casser le clavier, le drag-and-drop ou les mutations.
- Conserver le dark mode automatique et la bascule manuelle temporaire.
- Garantir WCAG AA : 4,5:1 pour le texte normal, 3:1 pour les éléments visuels essentiels.
- Privilégier une architecture visuelle réutilisable, avec tokens et composants cohérents.

## 11. Méthode de réalisation

Avancer progressivement dans cet ordre :
1. Tokens visuels et Header.
2. Colonnes et cartes Kanban.
3. Fenêtre de détails.
4. Dashboard Analytics.
5. Page d'accueil et finitions.

À chaque étape, examiner le diff et vérifier les principales interactions.
Éviter une réécriture massive sans vérification intermédiaire.

## 12. Validation finale

Avec Chrome DevTools MCP, vérifier :
- `/`, `/board` et `/analytics`.
- Modes clair et sombre.
- Desktop, tablette et mobile.
- Lisibilité et contrastes.
- Drag-and-drop et déplacements clavier.
- Ouverture et fermeture des détails.
- Membres, commentaires et checklist.
- Persistance et affichage des données API.
- Navigation au clavier et focus.
- Réduction des animations.

Exécuter :
- `npm run lint`
- `npm run build`
- Les tests existants
- `git diff --check`

Réaliser les revues Standards et Spec.
Documenter les décisions et résultats dans `.scratch/design-refresh/`.
Ne fais aucun commit ni push sans mon autorisation.
Réponds en français et présente un bilan des transformations effectuées.
