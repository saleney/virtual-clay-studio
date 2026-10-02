# Water and sustained smoothing — October 2, 2026

## Behavior
Water is a separate outlined droplet tool. Tap wet clay to briefly splash code-drawn droplets and give the inside and outside a darker, slicker finish. The finish dries back over approximately 18 seconds of active rendering. Water changes material uniforms only: no mesh rebuild, camera fit, profile change, paint mutation, or wheel/pan change. Reset and firing clear wetness. Enter/Space with the water-selected canvas provides a keyboard alternative.

Holding Sponge or Rib against a surface gradually softens carved grooves. Contact works while paused or turning; a turning wheel brings successive surface regions under the tool. Sponge is gentler, Rib stronger. Geometry updates are capped at about 12 per second rather than tied to pointer-event frequency. Holding the tools does not stretch the vessel vertically; distant grooves remain until contacted. Switching tools finishes an existing stroke cleanly.

## Automated regression checks
- `node tests/interior-stability.mjs`: all three clay amounts retain a bounded, attached cavity under repeated shortening, deepening, widening and neck squeezing.
- `node tests/water-and-smoothing.mjs`: water does not alter profiles, history, paint state, or hardware; inner and outer wet finishes agree; complete dry-back restores original roughness/clearcoat; fired/glazed clay ignores water; Sponge/Rib remove contacted grooves both paused and rotating, while distant grooves remain; mid-gesture tool switches finish shaping and brush gestures.
- Production build and syntax/diff checks pass.

## Rendered browser audit
The opt-in fixture is saved at `tests/browser-interaction-fixture.js`. For a local audit copy, append it after `atelier.js` and visit with `?qa&interaction-qa`. It is NOT appended to released code. Results are emitted in a DOM data attribute and saved as JSON here.

Usage styles tested:
- Tablet, 820×1180: rapid tool changes, oversized and reversed drags, repeated water taps, all three clay sizes, second-pointer interruptions, cancellation, and reset after a messy sequence.
- Desktop, 1280×720: careful tool changes, stationary 4.5-second holds, gradual groove removal, firing and automatic glazing; also the rapid stress sequence.
- Phone: stress audit at 320×740, manual wet-clay interaction at 390×844, and stress/export-render audit at 430×900. Six controls were measured at 44×44 CSS pixels on the standard phone. All rendered audits passed without reported JavaScript errors.

Each stress run exercises actual geometry and rendering: water preserves clay, cuts can be made after water, Sponge/Rib respond, all coordinates remain finite, the inner rim stays attached during 24 large/reversed gestures, competing pointers are ignored, cancelled gestures release state, and reset recovers. Slow stationary contact removes a seeded groove. The final large-phone audit additionally renders a finished PNG and checks restoration of the live renderer. Test PNG generation does not add pieces to the production or existing QA gallery.

## Limits
These are browser viewport and application-handler tests, not sessions with actual people or hardware iPad/iPhone Safari certification. Synthetic multi-pointer checks call handlers with a fixture-local capture adapter; genuine browser touch capture remains checked by application regression logic, not physical hardware. No guarantee is made for every possible gesture or device. The original cavity/upward-jump fix remains included and passes its regression suite.
