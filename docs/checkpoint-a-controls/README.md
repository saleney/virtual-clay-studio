# Checkpoint A — control positioning fixes

October 16, 2026. Local only; no deployment.

## Scope

Only `interface.css` changes application behavior:

1. Restore the starter chooser's centering transform with enough priority to beat the stale mobile `transform:none!important` rule.
2. Clear inherited centering transforms from the compact glaze tray and the now-in-flow effects panel. Retain existing sizes, spacing and scroll behavior.
3. Restore the existing Your shelf link, positioned in the header area on phones and just below the process header at desktop widths. Existing anchor destination and label retained.

No dock/inspector redesign, font changes, geometry/tool changes, phase/history changes, or shelf-key changes. Large expanded panels still cover part of the scene; that is deferred layout work. The compact effects tray remains scrollable, and lower content may require scrolling; all six checkboxes were exercised successfully.

## Browser prerequisite

Installed with `npm install --no-save --package-lock=false playwright` followed by `npx playwright install chromium webkit`. Neither package.json nor package-lock.json changed. A real Chromium 156.0.8078.4 and WebKit 27.2 were launched successfully before editing application CSS. Playwright WebKit is not a physical iPhone Safari performance test.

## Targeted real-browser checks

`node docs/checkpoint-a-controls/check.cjs before` and `node docs/checkpoint-a-controls/check.cjs after` start a temporary local HTTP server and load the unchanged application scripts, with continuous rendering enabled. No profile or phase injection. The test starts via the canvas keyboard gesture, clicks Fire it, waits for the real first kiln cycle and opens Customize glaze. Each run has isolated browser storage at its temporary QA origin.

Both engines passed after-fix checks at **320×667, 390×844, 430×844 and 1280×720**:
- Starter wrapper and all family/amount buttons horizontally within the viewport.
- Effects tray, panel and label bounds horizontally within the viewport.
- Every effect checkbox can be checked; finish select can be changed.
- Your shelf is visible and navigates to #your-shelf.
- No uncaught page errors; WebGL initialized.

Before/after rectangles and page errors: `before-results.json`, `after-results.json`. View all paired screenshots in [review.html](review.html). The 390px WebKit proof is [after-webkit-390-starter.png](after-webkit-390-starter.png), with its effects screenshot alongside.

| Width | Chromium starter left, before → after | Chromium effects left, before → after | WebKit starter left, before → after | WebKit effects left, before → after |
|---|---:|---:|---:|---:|
|320|160 → 5|−130 → 15|160 → 5|−123 → 19|
|390|195 → 40|−95 → 50|195 → 40|−88 → 54|
|430|215 → 60|−75 → 70|215 → 60|−68 → 74|
|1280×720|430 → 430|137 → 765|430 → 430|138 → 766|

Desktop panel coordinates alone do not describe the tray error: its inherited transform also shifted the entire compact tray left. The after checks validate both tray and panel bounds. Review screenshots show the actual arrangement, including unchanged wrapping/large panel behavior.

## Regression suites

All eight passed: connected-clay, gentle-carving, glaze-coverage, glaze-finish, interior-stability, rib, shelf-saving, water-and-smoothing. Full output: `regression-results.txt`. `git diff --check` passed.

## Legacy workflow suite — do not call this passed

Ran `CHROMIUM_EXECUTABLE="$(node -p 'require("playwright").chromium.executablePath()')" node tests/workflow-browser.cjs` unchanged. It fails at the first Brush click: the starter chooser has not been dismissed, so tools are hidden. This is an existing test-flow incompatibility, reproduced before the CSS changes. The suite exits at320, so a separate `workflow-widths.cjs` runner repeats the same source independently for each width; it changes only the width loop, not application logic or assertions. Independent results: **320 FAIL, 390 FAIL, 430 FAIL, 1280 FAIL**, all at the same hidden Brush control. Individual logs preserve failures. The suite itself is not edited to silently bypass the failure, and its later checks are not claimed as passed.

## Stop point

Checkpoint A only. Review and choose the next step before any redesign or deployment.
