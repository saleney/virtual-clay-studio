# Virtual Clay Studio evolution snapshots

These screenshots were rendered from detached temporary Git worktrees at a consistent 1440×1000 desktop viewport. Historical source files were not edited. All representative states were produced through the app’s visible controls and pointer gestures only.

## 1. First repository prototype

- **Commit:** `2ee10c98c289be0b3e415bb5d5286c0d799f5ce8`
- **Message:** Create Virtual Clay Studio prototype
- **Date:** 2026-08-22 01:26:30 -0700
- **What changed:** Established the initial plain-HTML/Three.js pottery-wheel prototype, atelier environment, radial clay profile, and core shaping actions.
- **Screenshot demonstrates:** The first repository version’s default spinning clay form and original minimal action layout.
- **Limitations / caveats:** Captured in its default state because the initial rendered form itself is the clearest faithful record of the prototype baseline.

## 2. Opening stage

- **Commit:** `313d3ccd63248604f15777b628243d10a5cf9d50`
- **Message:** Focus clay studio on direct throwing
- **Date:** 2026-08-22 02:25:09 -0700
- **What changed:** Refocused the interaction on direct throwing gestures and simplified the studio actions around shaping and resetting clay.
- **Screenshot demonstrates:** A vessel visibly reshaped through a direct pointer gesture, with the reduced throwing-focused controls.
- **Limitations / caveats:** The staged form is representative rather than deterministic because its exact silhouette depends on live pointer timing and the spinning wheel angle.

## 3. Tactile interior

- **Commit:** `3151fa4ce0b961155eb52ce7962b6dedf3abb4c3`
- **Message:** Polish tactile clay throwing
- **Date:** 2026-08-22 03:42:42 -0700
- **What changed:** Expanded and polished tactile shaping behavior, including the clay’s interior/opening model and more nuanced throwing response.
- **Screenshot demonstrates:** The softer, rounded tactile form produced through the milestone’s direct manipulation behavior.
- **Limitations / caveats:** The shallow viewing angle and live gesture response make the interior opening less legible than the exterior profile in a single still frame.

## 4. Stable V2

- **Commit:** `39e5a5c91acfbe3fa6a17d68911aa038035cc4f3`
- **Message:** Refine clay tools and wheel materials
- **Date:** 2026-08-22 13:22:05 -0700
- **What changed:** Refined pottery tools, slip colors, wheel speed/material presentation, and the interaction feedback for the tool era.
- **Screenshot demonstrates:** The full tool-and-slip palette, rust slip selection, active carving tool, and a visibly tool-shaped vessel.
- **Limitations / caveats:** Slip application is subtle under the studio lighting, so the selected rust swatch and carving deformation provide the clearest still-frame evidence of this workflow.

## 5. Phase 3 local alteration

- **Commit:** `6bef0a0fb3d77b7b445e9ffeeca892145408a248`
- **Message:** Add persistent local clay alterations
- **Date:** 2026-08-22 15:41:36 -0700
- **What changed:** Added persistent angle-localized dents, bulges, and rim alterations that remain attached to one part of the clay rather than changing the entire radial ring.
- **Screenshot demonstrates:** A paused-wheel Phase 3 state with a UI-staged opening and localized side/rim alteration.
- **Limitations / caveats:** The feature deliberately uses a soft localized falloff, so asymmetry is visible but subtle in the fixed camera view; pointer timing and wheel angle also affect its still-frame prominence.

## 6. Phase 3 final merge

- **Commit:** `d3188af0cd7b0e35641e5d233ae022da55295345`
- **Message:** Merge pull request #1 from saleney/phase-3-local-alteration
- **Date:** 2026-08-22 15:42:31 -0700
- **What changed:** Merged the Phase 3 local-alteration work into `main` without additional product changes beyond the merged feature set.
- **Screenshot demonstrates:** The final merged studio with the wheel paused and a localized hand-made dent retained on the vessel.
- **Limitations / caveats:** As in the Phase 3 feature commit, localized deformation is intentionally gentle and appears subtler in a still image than while rotating interactively.

## 7. Refined clay opening

- **Commit:** `f5e9c43`
- **Message:** Improve clay opening and top rounding
- **Date:** 2026-09-03
- **What changed:** Refined the first downward opening gesture, stabilized the inner clay floor, and softened the closed top so the transition from a lump to a vessel reads more naturally.
- **Screenshot demonstrates:** A formed vessel with an actual interior rather than a dark visual indentation painted over a solid form.
- **Limitations / caveats:** The opening remains intentionally forgiving and simplified. It models a radial interior rather than full particle-based clay physics.

## 8. Atelier cleanup

- **Commit:** `0105563`
- **Message:** Refine atelier background
- **Date:** 2026-09-03
- **What changed:** Reworked the generated background plate to clarify shelf construction, ceramic silhouettes, containers, and foreground pottery tools while retaining the fixed camera, daylight, plants, and quiet Reggio-inspired atmosphere.
- **Screenshot demonstrates:** A more physically coherent room whose shelf edges and open spaces can support saved virtual vessels.
- **Decision:** The earlier background remains in the repository as a rollback asset. Refinement was chosen over replacing the atelier's visual identity.
- **Limitations / caveats:** The room is still a flat photographic plate. Future shelf pieces therefore need carefully matched placement, scale, light, and contact shadows.

## 9. Mobile foundation

- **Commit:** `6e99281`
- **Message:** Add iOS and Android app wrappers
- **Date:** 2026-09-03
- **What changed:** Added Capacitor-based iOS and Android projects, safe-area behavior, mobile metadata, and a locally bundled Three.js module for offline use.
- **Decision:** Preserve the functioning WebGL studio inside native app shells instead of immediately rewriting the interface and 3D system separately in SwiftUI and Kotlin.
- **Evidence:** Both native projects receive the same validated web bundle through one repeatable synchronization step.
- **Limitations / caveats:** This is a native-distributable wrapper, not a SwiftUI rewrite. Physical-device, signing, TestFlight, and Play Store testing remain future work.

## 10. The first kept piece

- **What changed:** Added local creation saving, restoration after reload, a six-piece collection limit, generated silhouette thumbnails, and an interactive shelf presentation. Restored the missing visible `Fire it` action and repaired the fired/glazing control transition.
- **Product decision:** Saving begins as private device-local storage. It does not require an account, transmit creations, or imply cloud synchronization.
- **Test evidence:** A piece was fired, entered glazing, saved to the shelf, and remained present after a full browser reload. Selecting a shelf piece restores its profile, interior, alterations, material, fired phase, and saved glaze texture.
- **Limitations / caveats:** The shelf representation is a lightweight profile thumbnail rather than a second live Three.js scene. Saved pieces remain only in the current browser or app installation and can be removed by clearing site data.
- **Next question:** Does seeing a personal piece on the shelf create enough attachment that visitors want to make a second one?
