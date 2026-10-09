# 01 : Suivre le thème système et permettre une bascule manuelle

Status: ready-for-agent
Implémentation : terminée et vérifiée le 2026-10-09 ; sans commit ni push.
Blocked by: None
Spécification : [Sprint 3 — System-driven dark mode](../spec.md)
Couverture : CA1 à CA9 et cas limites de pilotage du thème.

## Responsabilité

Rendre le pilotage du thème opérationnel sur `/` et `/board`, avec un bouton explicite dans le Header et les mécanismes React/Chakra UI existants. Livrer un comportement vérifiable de bout en bout, incluant initialisation, bascule, navigation, rechargement et accessibilité du bouton.

## Fichiers potentiellement concernés

- `src/components/Layout.tsx`
- `src/components/Header.tsx`
- `src/hooks/useTheme.ts`
- `src/main.tsx`, uniquement si nécessaire pour intégrer le thème.

Ces indications orientent l'exploration ; elles n'imposent pas une nouvelle architecture.

## Critères d'acceptation

- [x] CA1 : accès direct à chaque route en système clair puis sombre ; thème initial correct.
- [x] CA2 : avant toute bascule, changements système suivis dans les deux sens sur chaque route.
- [x] CA3 : chaque activation affiche le thème opposé et le libellé correspondant : « Passer en mode sombre » en clair, « Passer en mode clair » en sombre.
- [x] CA4 : après la première bascule manuelle, les changements système sont ignorés jusqu'au rechargement.
- [x] CA5 : plusieurs bascules ou un retour manuel au thème système ne réactivent pas le suivi système.
- [x] CA6 : navigation aller-retour entre les deux routes, y compris précédent/suivant, conservant thème et mode de pilotage.
- [x] CA7 : rechargement complet sur chaque route reprenant la préférence système actuelle et abandonnant le choix manuel.
- [x] CA8 : aucune mémorisation du thème ou de son pilotage dans un stockage local, de session, cookie, base locale ou stockage distant.
- [x] CA9 : bouton accessible par Tab, activable par Entrée et Espace, avec focus visible et nom accessible explicite.
- [x] Cas limites : nouvel onglet indépendant ; absence de demande sombre donnant le clair ; changements système après navigation conformes au mode de pilotage.
- [x] Abonnements correctement nettoyés, sans accumulation ni dégradation du bouton sous React StrictMode.
- [x] Solution simple réutilisant React et Chakra UI, sans dépendance supplémentaire sans justification.

## Validation

Vérifier tous les scénarios de pilotage sur `/` et `/board` avec Chrome DevTools MCP en priorité, ou manuellement s'il n'est pas utilisable. Consigner les résultats et les éventuelles vérifications restant à effectuer ; ne pas déclarer réussis des scénarios non exécutés. Tester les comportements observables, sans dépendre de la structure interne du hook.

Exécuter `npm run build` et `npm run lint`, sans nouvelle régression, en distinguant les avertissements préexistants. Aucun framework de tests supplémentaire sans justification. Les vérifications d'une version antérieure ne remplacent pas celles de la version livrée.

## Comments

### Validation du ticket 01 — 2026-10-09

- Éléments préexistants examinés et réutilisés : Header, Layout partagé et hook en mémoire. Seule modification applicative de cette intervention : mise à jour fonctionnelle du choix manuel dans `src/hooks/useTheme.ts`, pour conserver la parité même lorsque deux activations sont regroupées dans un cycle React. Le scénario échouait avant la correction et réussit ensuite, sans réactiver le suivi système.
- Chrome DevTools MCP, version finale : accès direct clair/sombre, changements système dans les deux sens, bascules manuelles, priorité manuelle et rechargement reprenant la préférence actuelle sur `/` et `/board`. Contrôle des libellés et des couleurs calculées des surfaces et textes, sans utiliser les classes internes du hook comme assertions.
- Navigation par les liens du Header dans les deux sens, précédent/suivant, puis changements système : suivi conservé avant toute bascule, choix manuel conservé après bascule.
- Sur chaque route : trois Tab atteignent le bouton, focus visible avec contour calculé, Entrée et Espace inversent le thème et le libellé. Nom accessible explicite confirmé dans le snapshot d'accessibilité ; clic réel MCP vérifié également.
- Deux onglets de même origine et de même préférence claire affichent respectivement le choix manuel sombre et le thème système clair, sans partage du choix manuel. Absence de demande sombre : thème clair.
- Inspection des stockages navigateur sur les deux routes : localStorage et sessionStorage vides, aucun cookie et aucune base IndexedDB. Inspection du code : aucun stockage ni appel réseau ajouté pour le thème.
- Instrumentation temporaire de l'API navigateur sous StrictMode : deux ajouts, un retrait, un seul abonnement actif ; compte inchangé après six navigations. Aucun fichier applicatif modifié pour cette instrumentation.
- `tsc -b` et `npm run build` réussis ; avertissement préexistant de bundle supérieur à 500 kB. `npm run lint` : aucune erreur, les deux avertissements préexistants de Confetti uniquement. `git diff --check` réussi (simple avis de conversion LF/CRLF concernant une configuration MCP modifiée hors de cette intervention).
- Aucun script de suite de tests ni framework applicatif configuré dans package.json ; validation fonctionnelle effectuée au point de test navigateur convenu.
- Revue finale code-review : Standards, aucun problème concret ; Spec, aucun écart identifié sur le ticket 01. Deux revues indépendantes en lecture seule.
- Des reconnexions MCP ont interrompu certains essais ; ces contrôles ont été repris avec succès. Aucun scénario du ticket 01 ne reste à réaliser manuellement. Ticket 02 et Confetti non modifiés pendant cette intervention ; audit visuel CA10–11 hors périmètre.
- État : implémentation du ticket 01 terminée et critères vérifiés. Le statut de triage reste `ready-for-agent`, la convention locale ne définissant aucun statut « terminé » pour ces tickets ; l'état d'implémentation est consigné séparément. Aucun commit ni push.

Découpage et absence de dépendance validés par l'utilisateur. L'enregistrement du ticket n'autorise pas encore l'implémentation.

Inspection préalable de `src/hooks/` : un seul fichier non suivi, `useTheme.ts`, créé par l'assistant pendant cette session avant la demande de spécification. Il est déjà importé par le Layout modifié et utilise la préférence système, un choix manuel en mémoire, un abonnement nettoyé et les classes de thème du document. Il s'agit de travail préexistant non validé, à examiner et réutiliser si approprié, sans écrasement ni suppression automatique. La compilation et le lint de cette version avaient terminé ; le lint signalait deux avertissements préexistants dans Confetti. Les scénarios navigateur n'ont pas été validés : les essais MCP ont échoué lors de reconnexions/pertes d'identifiants de page. Aucun fichier applicatif n'a été modifié pendant cette inspection.
