# Checkpoint B — fixed phone dock

Local review only; no deployment. Uses the existing actions, history, stage transitions, final-firing reveal and shelf storage key.

## Changes
- Phones at 620px and below have separate header, clay and dock regions. The dock sizes to its contents, capped at320px/52dvh. Empty space returns to the clay. Dock height freezes during a canvas gesture and refits after release.
- Existing controls move into the dock and return to their original desktop positions across the breakpoint. No duplicate actions or listeners are created.
- Starter clay families remain in one row, with a small swatch above each full name. Starter choices, throwing, kiln status, glazing and completed actions use the same region. Tool settings and glaze effects replace its contents, with Back and Escape support. Back preserves the selected slip material.
- 13px tool labels, hints and actions (explicitly approved in follow-up); 16px native fields; at least 44px targets. Glaze effects use two compact columns, including at 320px. Related controls use2–4px gaps. Starter instruction and shelf share a row. Undo/Redo share the firing-action row; New clay sits separately below. Your shelf remains available from each main stage view.
- Tool choices use a horizontally scrollable labeled row, with the next item partially visible at 320px. Swatches also scroll horizontally. No movable palette handle or Reset position on phones.
- Phone camera framing uses the actual protected canvas. Changed forms refit after the gesture, never during a held shaping/painting stroke; pending resize work is also deferred. Raycasting still uses the rendered canvas bounds. Desktop camera calculations remain unchanged.

## Evidence and validation
Real installed Chromium 156.0.8078.4 and WebKit 27.2 were launched before editing.

`node docs/checkpoint-b-phone-dock/check.cjs` passes in both engines at 320×667, 390×844, 430×844 and 1280×720. Phone contexts emulate touch. Each phone run performs a real pointer drag and confirms Undo becomes enabled; opens Rib/Carve/Brush settings; confirms Back retains slip; runs both kiln cycles; clicks all six effect checkboxes; selects Gloss; dips; and reaches the saved completion stage. Assertions check separate canvas/dock bounds, horizontal control bounds, minimum13px font/44px target sizes, and absence of page errors. Scrollable tool/swatch strips are deliberately excluded from full-width visibility assertions.

Desktop follow-up now places recovery beside speed, aligns glaze actions and brush, and opens a native dialog. The updated check closes it with Done; panel expansion no longer affects the toolbar.

All eight regression suites pass: connected-clay, gentle-carving, glaze-coverage, glaze-finish, interior-stability, rib, shelf-saving, and water-and-smoothing. Output is in regression-results.txt. Existing test files, package.json and package-lock.json were not changed. The older workflow-browser.cjs starter-dismissal issue documented in Checkpoint A was not repaired or claimed passing.

Additional resize checks cover 10/15 lb starter clay and phone→desktop→phone settings navigation in both engines. See resize-results.json and the large-clay screenshots.

## Limits / tradeoffs
The former fixed310px dock was rejected for wasting space. Current height follows its content; the camera uses the remaining clay region and waits until a gesture ends to refit. Settings can scroll internally on short screens. Screenshot dimensions are browser viewports, not physical-phone usable-area guarantees.

These are real browser-engine runs, not physical iPhone or mid-range Android hardware performance certification. No tool logic, sculpting safeguards or storage migration is included. Deployment was subsequently authorized on October17.

The review page links Checkpoint A's before evidence and this checkpoint's screenshots. All captures render the real studio; no clay profile was injected.
