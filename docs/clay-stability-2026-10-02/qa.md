# Clay stability — October 2, 2026

## Evidence and cause
The supplied iPhone recording shows an elevated cylindrical interior above a shortened outer vessel. Its final frames show that interior stretching beyond the screen.

Outer profile edits did not update the cavity's rim height. `openClay` then measured depth against the new outer top but normalized against the stale inner floor, potentially dividing by 0.001 when the floor was above the outside rim. That extrapolated cavity heights far above the vessel. The detached inner mesh could also intercept rays intended for outer-wall tools.

## Focused changes
- Reconcile cavity heights and wall clearance before rebuilding, and before deepening. The inner rim follows the outer rim; interpolation stays between the floor and rim.
- Reserve opening/widening gesture modes for Hands. Rib previously entered those modes when touching the top/interior.
- Clear active gestures on reset/new clay; ignore a competing pointer; release gesture state on lost pointer capture.
- Keep water out of this release. Its experiment patch is stored locally at `/tmp/clay-water-experiment.patch`.
- Preserve hardware geometry, camera framing, materials, shelves, UI, and production gallery storage.

## Verification
`node tests/interior-stability.mjs` passes for all three clay amounts: shortening an opened vessel, 100 consecutive deepen/widen operations, subsequent height change, and neck squeeze. Assertions check finite coordinates, inner rim alignment, floor bounds, and wall clearance.

Browser checks used the in-app browser at narrow and standard phone layouts (312 and 390 CSS pixels initially), a confirmed 430×900 CSS-pixel viewport, a wider mobile viewport, and desktop 1185×997. Opening and widening, diagonal carving, Sponge→Rib→Hands after carving, Brush slip control visibility, firing's automatic glaze transition, and reset were exercised. No JavaScript errors were reported during the tested sequence. Existing isolated QA shelf images remained present; no production gallery data was changed.

Saved screenshots include the original recording's upward-jump frame, corrected mobile opening, mobile glazing, and desktop opening. Browser controls briefly changed the effective viewport during testing; the final 430-pixel viewport was explicitly verified from the DOM. Tests are browser mouse-driven gestures at mobile layouts, not hardware iPhone touch/Safari performance certification. This is a fix for the reproduced cavity mismatch, not a guarantee that every possible gesture sequence has been exhausted. Saved-piece output was not changed or re-tested in this focused pass.
