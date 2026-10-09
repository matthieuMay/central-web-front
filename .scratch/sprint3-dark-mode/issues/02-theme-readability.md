# 02 : Garantir la lisibilité du tableau et préserver les fonctionnalités

Status: ready-for-agent
Implémentation : terminée et vérifiée le 2026-10-09 ; sans commit ni push.
Blocked by: 01
Spécification : [Sprint 3 — System-driven dark mode](../spec.md)
Dépendance : [01 — Suivre le thème système et permettre une bascule manuelle](01-system-theme-toggle.md)
Couverture : CA10 et CA11, puis vérification globale CA1 à CA11.

## Responsabilité

Adapter toutes les surfaces, textes et contrôles aux deux thèmes en réutilisant les couleurs sémantiques de Chakra UI, puis vérifier le Sprint dans son ensemble sur `/` et `/board`.

Le ticket 01 doit être terminé pour tester les thèmes et les états du bouton dans les conditions réelles. Le statut de triage ne supprime pas cette dépendance.

## Fichiers potentiellement concernés

- `src/components/Layout.tsx`
- `src/components/Header.tsx`
- `src/components/Column.tsx`
- `src/components/Card.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/index.css`

Ces indications orientent l'exploration. Les données et le modèle du tableau restent inchangés.

## Critères d'acceptation

- [x] CA10 : contrastes mesurés selon les seuils WCAG AA de la spécification : au moins 4,5:1 pour le texte normal, 3:1 pour les grands textes et les composants visuels essentiels.
- [x] Cartes, colonnes, titres, descriptions, liens, navigation active, bouton, survol et focus lisibles dans les deux thèmes.
- [x] Réutilisation maximale du theming et des couleurs sémantiques Chakra UI, avec une solution simple et cohérente avec l'architecture existante.
- [x] CA11 : liens existants, ordre des cartes et colonnes, descriptions facultatives, message de colonne vide et textes longs préservés.
- [x] Disposition responsive à une, deux et quatre colonnes conservée, sans régression sur mobile et bureau.
- [x] Aucun changement des données du tableau ni nouvelle fonctionnalité métier.
- [x] Tous les scénarios fonctionnels de la spécification CA1 à CA11 vérifiés sur `/` et `/board`, avec résultats consignés.
- [x] `npm run build` et `npm run lint` exécutés sans nouvelle régression ; avertissements préexistants distingués.
- [x] Aucune nouvelle dépendance ni framework de tests supplémentaire sans justification.

## Validation

Privilégier Chrome DevTools MCP pour les scénarios navigateur et les mesures de contraste ; recourir aux vérifications manuelles s'il n'est pas utilisable et consigner leurs résultats. Vérifier les styles réellement affichés dans les deux thèmes, y compris survol, focus et navigation active : l'usage d'un token sémantique ne suffit pas à prouver le contraste.

Rejouer la matrice fonctionnelle de la spécification sur les deux routes : initialisation, changements système avant/après bascule, bascules répétées, navigation, précédent/suivant, rechargement, clavier et absence de stockage. Documenter aussi les vérifications responsive et de contenu. Ne pas déclarer réussis des scénarios non exécutés.

## Comments

### Implémentation et validation — 2026-10-09

Ticket 01 terminé et dépendance satisfaite. Adaptations préexistantes examinées et réutilisées ; correction des contrastes du bouton, des bordures et des contours de focus, avec les tokens sémantiques Chakra UI. Navigation active soulignée. Données, fonctionnalités et responsive préservés ; aucune nouvelle dépendance.

CA1 à CA11 vérifiés avec Chrome DevTools MCP, build et lint réussis sans nouvelle régression, `git diff --check` réussi. Aucun scénario restant manuel. Revue Standards et Spec sans problème concret identifié. Aucun commit ni push. Le statut de triage est conservé car la convention locale ne définit pas de statut « terminé » ; l'état d'implémentation est consigné séparément.

Résultats détaillés, scénarios et ratios mesurés : [validation finale du ticket 02](../validation-ticket-02.md).

Découpage et dépendance envers le ticket 01 validés par l'utilisateur. L'enregistrement du ticket n'autorise pas encore l'implémentation.

Des adaptations de couleurs non commitées existent déjà dans les composants et styles concernés ; elles constituent du travail préexistant non validé à examiner lors de la prise en charge du ticket, sans suppression ni écrasement automatique.
