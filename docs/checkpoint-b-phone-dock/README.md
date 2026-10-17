> Preservation note: the latest user changes supersede the fixed-height/14px design described below. The dock now sizes to content, hints omit tool names, the starter instruction shares a row with the shelf, and compact labels are13px while native fields remain16px and targets≥44px. Final validation of these last edits is pending. DECISIONS.md is the authoritative handoff.

# Checkpoint B — fixed phone dock

Local review only; no deployment. Uses the existing actions, history, stage transitions, final-firing reveal and shelf storage key.

## Changes
- Phones at 620px and below have separate header, clay and dock regions. The dock reserves 310px including its padding; opening settings does not resize the clay region.
- Existing controls move into the dock and return to their original desktop positions across the breakpoint. No duplicate actions or listeners are created.
- Starter clay families remain in one row, with a small swatch above each full name. Starter choices, throwing, kiln status, glazing and completed actions use the same region. Tool settings and glaze effects replace its contents, with Back and Escape support. Back preserves the selected slip material.
- 14px tool labels, hints and actions; 16px native fields; at least 44px targets. Glaze effects use two compact columns, including at 320px. Related controls use 4px gaps. Undo/Redo share the firing-action row; New clay sits separately below. Your shelf remains available from each main stage view.
- Tool choices use a horizontally scrollable labeled row, with the next item partially visible at 320px. Swatches also scroll horizontally. No movable palette handle or Reset position on phones.
- Phone camera framing uses the actual protected canvas. Changed forms refit after the gesture, never during a held shaping/painting stroke; pending resize work is also deferred. Raycasting still uses the rendered canvas bounds. Desktop camera calculations remain unchanged.

## Evidence and validation
Real installed Chromium 156.0.8078.4 and WebKit 27.2 were launched before editing.

`node docs/checkpoint-b-phone-dock/check.cjs` passes in both engines at 320×667, 390×844, 430×844 and 1280×720. Phone contexts emulate touch. Each phone run performs a real pointer drag and confirms Undo becomes enabled; opens Rib/Carve/Brush settings; confirms Back retains slip; runs both kiln cycles; clicks all six effect checkboxes; selects Gloss; dips; and reaches the saved completion stage. Assertions check separate canvas/dock bounds, horizontal control bounds, minimum font/target sizes, and absence of page errors. Scrollable tool/swatch strips are deliberately excluded from full-width visibility assertions.

Desktop is a compatibility check, not a redesign. The compact desktop effects disclosure can be obscured after expansion in WebKit; the existing native summary is closed using keyboard Enter during the desktop check. This pre-existing desktop issue remains for the later checkpoint.

All eight regression suites pass: connected-clay, gentle-carving, glaze-coverage, glaze-finish, interior-stability, rib, shelf-saving, and water-and-smoothing. Output is in regression-results.txt. Existing test files, package.json and package-lock.json were not changed. The older workflow-browser.cjs starter-dismissal issue documented in Checkpoint A was not repaired or claimed passing.

Additional resize checks cover 10/15 lb starter clay and phone→desktop→phone settings navigation in both engines. See resize-results.json and the large-clay screenshots.

## Limits / tradeoffs
At 320×667 the protected clay region is 301px high; at 390/430×844 it is 478px high. This can make the wheel smaller than the earlier overlapping composition. Keeping a full-size vessel while reserving readable controls is not possible on every short screen. Settings scroll within the dock where necessary; Back stays reachable. The reserved height avoids camera jumps simply from opening settings.

These are real browser-engine runs, not physical iPhone or mid-range Android hardware performance certification. No desktop typography redesign, tool logic, sculpting safeguards, storage migration, or deployment is included.

The review page links Checkpoint A's before evidence and this checkpoint's screenshots. All captures render the real studio; no clay profile was injected.
