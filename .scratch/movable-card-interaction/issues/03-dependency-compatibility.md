Type: research
Status: resolved

Related tickets: 01, 02, 04

## Question

Which supported package versions and integration constraints should the handoff specify for `react-dnd` with its HTML5 backend and a maintained confetti library in this repository's React 19, Vite, Chakra UI, and Motion stack?

## Findings

### Repository baseline

- The manifest currently pins React and React DOM `^19.2.8`, Vite `^8.3.0`, Chakra UI `^3.37.0`, Motion `^14.0.0`, and Node `>=22.22.0`; the app is a Vite client entry using `createRoot(document.getElementById('root')!)`, `ChakraProvider`, and `BrowserRouter` (`package.json`, `src/main.tsx`, `vite.config.ts`).
- There is no SSR entry or server build in the repository. This makes a browser-only DnD provider compatible with the current app, but keep the provider and celebration rendering client-only if SSR is introduced.

### React DnD + HTML5 backend

- Use the matching maintained release pair `react-dnd@16.0.1` and `react-dnd-html5-backend@16.0.1` (both are the npm `latest` manifests at research time). `react-dnd` declares peer `react >=16.14` and optional `@types/react >=16`, so React 19 satisfies the declared range; the HTML5 package depends on `dnd-core ^16.0.1` and is the officially supported HTML5 backend ([react-dnd npm manifest](https://registry.npmjs.org/react-dnd/latest), [HTML5 backend npm manifest](https://registry.npmjs.org/react-dnd-html5-backend/latest), [backend README](https://github.com/react-dnd/react-dnd/blob/main/packages/backend-html5/README.md)).
- Integrate with `<DndProvider backend={HTML5Backend}>`; the backend is browser-oriented: its implementation accepts an optional `window` context and registers native drag event listeners during setup ([HTML5 backend factory source](https://github.com/react-dnd/react-dnd/blob/main/packages/backend-html5/src/index.ts), [HTML5 backend implementation source](https://github.com/react-dnd/react-dnd/blob/main/packages/backend-html5/src/HTML5BackendImpl.ts)). Do not instantiate it in a server-only module; the current `createRoot` entry is already client-only.
- The backend README only promises evergreen-browser support and explicitly calls out browser inconsistencies; acceptance testing should therefore cover the browsers required by the product rather than treating HTML5 DnD as uniform ([backend README](https://github.com/react-dnd/react-dnd/blob/main/packages/backend-html5/README.md)).

### Confetti choice and integration

- Prefer `react-confetti@6.4.0`: npm `latest` declares peer support through React `^19.0.0`, uses a canvas component, and ships a maintained release workflow ([react-confetti npm manifest](https://registry.npmjs.org/react-confetti/latest), [upstream README](https://github.com/alampros/react-confetti/blob/master/README.md)).
- Its implementation creates the animation in `componentDidMount`, stops it in `componentWillUnmount`, renders an absolutely positioned `canvas` with `pointerEvents: none`, and defaults dimensions from `window` with an SSR-safe fallback (`300×200`) ([ReactConfetti source](https://github.com/alampros/react-confetti/blob/master/src/ReactConfetti.tsx), [confetti engine source](https://github.com/alampros/react-confetti/blob/master/src/Confetti.ts)).
- Use a small local wrapper rather than exposing the package throughout the board: trigger it only after a confirmed successful move, set `recycle={false}` for a finite celebration, choose an explicit `numberOfPieces`, and pass `aria-hidden`/`pointerEvents: none` as appropriate. A Chakra `Portal` is optional, not required: Chakra's portal renders at the end of `document.body`, supports a custom container or `disabled`, and recommends conditional client rendering when SSR mismatch warnings occur ([Chakra Portal docs](https://chakra-ui.com/docs/components/portal)). If the celebration must escape board stacking/overflow, portal the wrapper; otherwise keep it in a positioned board shell.
- The existing `src/components/Confetti.tsx` is a bespoke Motion particle effect: it renders 40 absolutely positioned `motion.div`s, uses random values during render, and has no reduced-motion branch or portal/container contract. Replace its engine with `react-confetti` behind a compatible local wrapper rather than running both systems; preserve the current success-trigger API if callers depend on `particleCount`.

### Reduced motion

- Motion's default `MotionConfig` policy is `"never"`; `"user"` respects the device preference and disables transform/layout animations while retaining opacity/background-color animation ([MotionConfig docs](https://motion.dev/docs/react-motion-config)). The existing custom component does not opt into that policy.
- For the celebration wrapper, either omit the effect when `useReducedMotion()` is true or render a non-motion/static success cue. Motion's hook explicitly reports the current preference and re-renders when it changes ([`useReducedMotion` docs](https://motion.dev/docs/react-use-reduced-motion)). A canvas confetti library does not inherit Motion's reduced-motion policy automatically, so the wrapper must gate it.

## Recommendation

Add the matching `react-dnd@16.0.1` / `react-dnd-html5-backend@16.0.1` pair and wrap `react-confetti@6.4.0` in a client-side, reduced-motion-aware celebration component. Keep the current Vite-only client assumption explicit; use Chakra `Portal` only when stacking or overflow requires it. Do not retain the bespoke particle effect in parallel.

## Answer

Specify `react-dnd@16.0.1` with the matching `react-dnd-html5-backend@16.0.1`, configured through `<DndProvider backend={HTML5Backend}>`. The declared React peer range includes React 19, but the HTML5 backend is browser-oriented and only promises evergreen-browser behavior; keep it in the existing client entry and test the supported browser matrix.

Specify `react-confetti@6.4.0` behind a local wrapper. It is React 19-compatible, canvas-based, SSR-safe only through its client lifecycle/fallback behavior, and renders non-interactive output. Trigger it after a confirmed move, use finite output (`recycle={false}`), gate it with `useReducedMotion()`, and portal it through Chakra only when board overflow or stacking requires that. Replace the bespoke Motion particle engine rather than running both. Primary evidence and links are recorded in the findings above.
