# Refonte UI/UX Mini-Trello

Status: ready-for-agent

## Critères

- D1 : tokens Chakra sémantiques, palette turquoise/violet/ciel/lavande, surfaces pastel claires et sombres désaturées ; AA texte 4,5:1 et indicateurs essentiels 3:1.
- D2 : Header horizontal, marque, trois routes, page active, hover/focus, thème automatique/bascule temporaire et petits écrans.
- D3 : Kanban quatre accents backlog ciel, doing violet, review orange, done turquoise ; titres/compteurs, état vide, responsive 1/2/4 colonnes préservé.
- D4 : cartes aérées, résumé description/checklist/commentaires/initiales membres, hover doux/focus visible ; DnD et marqueurs conservés.
- D5 : grande modale centrale, titre/description puis membres/checklist/commentaires distincts, tous les formulaires et gestion de focus/Échap/erreurs conservés.
- D6 : Analytics KPI et barres/charge/avatars colorés ; calculs et règles Sprint 6 strictement identiques.
- D7 : accueil accueillant, accès Tableau et Analytics ; navigation/routes conservées.
- D8 : transitions discrètes, prefers-reduced-motion respecté ; logique confettis inchangée.
- D9 : contrôleurs, transport/contrats, mutations/cache et thème conservés ; aucune dépendance/backend/base/secrets/commit/push.
- D10 : étapes progressives avec diff et contrôles intermédiaires, Chrome trois routes/deux thèmes/trois tailles/contrastes/interactions, tests existants, lint/build/diff-check et revues.

## Audit et architecture

Sprint 6 non commité au départ : App/Header modifiés et fichiers Analytics/tests/docs nouveaux. Ces changements sont conservés. Référence de revue de la seule refonte : copie de src avant modification dans `C:/Users/hugoc/AppData/Local/Temp/design-refresh-baseline-20261013T145627Z/src`. HEAD reste 1bb038408517867140c981af86e661e8ca2b1c7c.

Thème Chakra createSystem(defaultConfig, configuration locale), tokens fg/bg/border et palettes sémantiques tone.sky/violet/orange/teal. Teintes primaires exactes présentes dans les tokens bruts ; nuances plus foncées pour les textes/boutons clairs afin d'obtenir AA. Ombres et rayons partagés. Composants visuels réutilisables : MemberAvatar, Surface et accents de colonne partagés entre Kanban/Analytics.

Le dialog HTML natif est conservé : le remplacement par une autre modal risquerait de modifier les interactions validées. Chakra assure les surfaces et la mise en page internes ; CSS porte uniquement le dialog, les contrôles natifs et les états/transitions communs. Aucun déplacement de carte animé ; aucune transition globale de positions. prefers-reduced-motion neutralise transitions et animation de la refonte.

Couleur de colonne déterminée par ses IDs existants (sprint-backlog/doing/review/done), avec repli visuel par index pour une colonne inconnue. Ceci ne détermine jamais le statut métier ; les calculs existants gardent la dernière colonne.

Finitions : couleurs de thème instantanées pour préserver le contraste, transitions limitées aux ombres/bordures. Dialog centré avec margin:auto malgré le reset Chakra. Aide native repliable conservant les instructions et aria-describedby.

## Séquence

1. Thème + Header/Layout ; build/diff et navigation/thème.
2. Colonnes + cartes/avatars ; diff et clavier/DnD.
3. Dialog et surfaces de sections ; diff et fermeture/focus/formulaires.
4. Analytics ; diff et tests de calcul/affichage.
5. Accueil et finitions ; validation globale et revues.

Les tests d'écriture sont simulés dans le navigateur pour ne modifier aucune donnée PostgreSQL ; les lectures API réelles vérifient le rendu et la conservation des collections. Les limites de validation sont consignées dans validation.md.
