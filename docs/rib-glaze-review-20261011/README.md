# Directional rib and two-fire glaze review — October 11, 2026

LOCAL ONLY. No deployment or push.

Before checkpoint: e6e7812, tagged checkpoint/rib-glaze-before-20261011. Rib checkpoint: bbe04e0. Glaze checkpoint is the next local commit.

The prior safeguard used each gesture’s immutable starting profile and capped pressure so pointer density could not shrink the edited wall repeatedly. The new rib retains those constraints, tracks actual raycast contact height, permits signed inward/outward pressure, and smooths the existing curved contour rather than forcing a line. Per-ring displacement caps, anchored base, radius/slope limits and hollow-wall clearances remain. Center opening/deepening/widening paths remain distinct. This is a stable radial-profile approximation, not full material physics.

Glaze stores the same canonical RGBA paint texture for Undo/Redo. Before final firing, its shader desaturates/lightens the appearance, roughness is .94 and clearcoat is zero. Completion switches the same coating to canonical colors, roughness .24, clearcoat .65, and groove pooling before the shelf PNG is captured. No text is added to explain the transformation. Re-glazing resets the preview finish.

Screenshots: rib-before.png and rib-after.png use the same starting contour, pressure sequence, lighting and viewport. Glaze-before.png is the old glossy application; glaze-after-unfired.png is the new chalky application; glaze-after-fired.png is its final-fired finish.

Passed: rib checks for 42/56 rings and 5/10/15 lb, pressure/event-density equivalence, curved contour retention and 300 repeated gestures per case; interior/cavity stability; water and held smoothing; connected shaping; gentle carving; finish-uniform transition checks; browser-rendered exact shape and paint Undo/Redo; first/final phase guards, locked final-fire button, unchanged canonical paint, one shelf save, and reset after firing. Phone checks used an actual 390x844 iframe viewport, with animation running and real rib drag plus Undo/Redo. No physical-device performance claim.

Opt-in fixture saved in tests/rib-glaze-review-fixture.js, excluded from atelier.js. Full cloud workflow test expectations updated, but that headless script was not rerun here. Original UI’s completed-stage duplicate New clay controls remain a pre-existing issue outside these two changes.
