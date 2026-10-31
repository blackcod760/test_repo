# Phased plan — Bot_ui → Next.js reimplementation

This repo (test_repo) now holds the **Next.js scaffold + one vertical slice** of the Bot_ui
reimplementation. This document maps the remaining Bot_ui feature areas to future specs.

## Shipped in this phase (spec #1400 T1)

- Next.js app shell + routing
- Zustand feature folders (replacing Pinia)
- SDK adapter layer (`src/features/flows/api/`) with backend proxied through Next.js route
  handlers — bbot credentials stay server-side
- React Flow canvas (replacing Vue Flow)
- One node type end-to-end: **text message node** — add, edit, connect, save/load

## Phase 2 — remaining node editors (~20)

Each node type gets its own spec, one or a few at a time. The vertical-slice `textNode` is the
template: a `NodeEditor` component + its data schema + registration in the `nodeTypes` registry.

Candidate node editors to port (from Bot_ui's editor set):

- media message (image / audio / video / document)
- delay / wait
- condition / branch
- user input / free text capture
- webhook / HTTP request
- assign agent / handoff
- tag / untag contact
- set variable (covered under Phase 4 variable system)
- template message
- location, contact card, interactive (buttons / lists)
- flow start / trigger node
- jump / go-to-flow
- …remaining editors per Bot_ui inventory

## Phase 3 — surveys

Survey builder, question types, branching logic, response collection. Own spec.

## Phase 4 — media

Media library: upload, storage, picker components, per-message media attachment. Own spec.

## Phase 5 — variables

Variable system: definition, scoping, expression evaluation, `set variable` node integration.
Own spec.

## Phase 6 — tours / onboarding

Guided tours, first-run onboarding, in-app help overlays. Own spec.

## Rules for every later phase

- Feature-folder architecture: each feature owns `components/`, `store/`, `api/`.
- All backend calls go through the SDK adapter layer → route handlers → bbot proxy. No
  client-side credentials, no direct browser calls to the backend.
- Zustand replaces Pinia; React Flow replaces Vue Flow.
- One spec per feature area; do not batch unrelated editors into a single spec.
