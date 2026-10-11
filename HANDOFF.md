# Virtual Clay Studio — local Codex handoff

Saved October 11, 2026. Continue from GitHub; no cloud-only feature implementation is required.

## Repository and saved branches

- Repository: https://github.com/saleney/virtual-clay-studio
- Production branch: `main`
- Latest deployed commit: `c3cf7eef0008a05404fe679f617455867df161c9`
- Deployed release: https://github.com/saleney/virtual-clay-studio/commit/c3cf7eef0008a05404fe679f617455867df161c9
- Release PR, merged: https://github.com/saleney/virtual-clay-studio/pull/6
- Original implementation branch: `tactile-studio-20261011`, head `ead32a1e2df9428e5b79d70d1a6b59f01b550cf0`. It is already squash-merged; continue from main rather than merging it again.
- Handoff branch: `codex-handoff-20261011`, based on the deployed main commit. This branch adds this document, `docs/original-tool-brief.md`, `tests/live-smoke.cjs`, and a Chromium-path environment override in `tests/phase-note-layout.cjs`. These handoff additions have not been merged or deployed.
- Live site: https://saleney.github.io/virtual-clay-studio/
- Successful Pages deployment: https://github.com/saleney/virtual-clay-studio/actions/runs/38128451776

## Deployed behavior

Earlier releases implemented the broad rigid rib, rib/hand center opening and widening, Hands → Rib → Carve → Sponge → Brush ordering, distinct Water/Slip/Glaze behavior, two firings, browser-local saved pieces, and kiln messages above the clay.

The latest release adds:

- Visible chronological Undo/Redo across clay and paint, regardless of the selected tool; Cmd/Ctrl+Z, Shift+Z, and Ctrl+Y shortcuts.
- Tool names on phones, stable gesture hints, and distinct contact markers for hands, rib, carving tip, sponge, water and brush.
- “Wet clay” temporarily selects Water and returns to the previous tool after the wetting gesture. Water softens a local section without changing its shape and dries over about 18 seconds.
- Upward shaping raises and narrows the upper wall; downward shaping settles and spreads it. Approximate volume balancing and hollow-wall bounds keep repeated shaping stable.
- A more visible initial opening and a rounded lip; subtler irregularity in the mound and throwing rings.
- Carving width/depth controls and undoable shallow foot trimming.
- “Ready for glaze” and “Firing the glaze…” wording. Camera framing reserves space for the hints, recovery controls and firing messages.

The eight release files were verified byte-for-byte against GitHub. Live JS and CSS were downloaded and compared with the tested local files after deployment. Preserve the production localStorage shelf key and bundled Three.js architecture. Read AGENTS.md before editing.

## Unfinished work and known limits

No unfinished feature code or known failing test remains from the authorized release. The separate handoff branch is the only unmerged work.

Open follow-up: the user wants to watch a localhost preview in their local Codex session. The cloud session could run a server but had no port-sharing/browser-control tool. This is an environment capability, not an application defect. A local checkout can serve the site directly; forward port 8000 only if the local environment requires it.

Validation limits:

- Clay remains an approximate radial-profile model with local marks, not a complete physical clay simulation. Volume conservation is approximate, and safe geometric limits constrain extreme shapes.
- Browser tests freeze the continuous animation loop after its first frame because cloud software rendering is slow. They verify gestures, geometry, UI and firing timers, but do not establish long-running animation performance on real phones.
- Native iOS/Android builds and real-device touch/pressure behavior were not tested in this session.
- The clay appearance and pottery feel still deserve the user's hands-on review; this release does not claim photorealism.

## Tests run and passed

- `node --check atelier.js` and `git diff --check`.
- `node tests/rib.test.cjs`: rigid rib geometry at 42 and 56 rings.
- `node tests/interior-stability.mjs`: opening, widening, shortening, rim attachment and cavity bounds for 5/10/15 lb.
- `node tests/water-and-smoothing.mjs`: local wetness, greater response when wet, drying, no water deformation, sponge/rib held smoothing, mid-gesture tool changes, opening isolation.
- `node tests/connected-clay.mjs`: raised/narrowed and settled/spread clay, initial pull volume drift below 0.5%, finite repeated shaping and supported hollow walls across 42/56 rings, all clay sizes, solid and hollow forms.
- `node tests/workflow-browser.cjs`: 320/390/430/1280 px; quick-water return, recovery after switching tools, actual carving dimensions, foot trimming, mobile names/icons, contact markers, rounded rim geometry, mixed clay/paint history, slip versus glaze, rib opening/widening, two firings, exactly one shelf save and reset cancellation. Narrow phone height is 667 px.
- `node tests/phase-note-layout.cjs`: 320×667, 390×844, 430×932, 768×1024 and 1280×900; all firing messages above 5/10/15 lb clay.
- Published-page mobile smoke check: new controls, shaping, Undo, foot trimming and initialization without page errors. Its reusable version is now `tests/live-smoke.cjs` on the handoff branch.

The geometry scripts import the bundled ES module and may emit Node's MODULE_TYPELESS_PACKAGE_JSON warning. It did not prevent passing. No production dependency was added for testing.

## Continue locally

Use an isolated branch/worktree if your local checkout already has edits. Fetch rather than overwrite local changes:

```sh
git clone https://github.com/saleney/virtual-clay-studio.git
cd virtual-clay-studio
git fetch origin
git switch --track origin/codex-handoff-20261011
python3 -m http.server 8000
```

Open http://localhost:8000/ in your local browser. If already cloned, omit the clone and cd steps. To continue only the deployed app, branch from `origin/main`; the handoff branch includes the same app plus these recovery documents/tests.

For browser checks, provide Playwright locally without adding a production dependency:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
export CHROMIUM_EXECUTABLE="$(node -p "require('playwright').chromium.executablePath()")"
node tests/rib.test.cjs
node tests/interior-stability.mjs
node tests/water-and-smoothing.mjs
node tests/connected-clay.mjs
node tests/workflow-browser.cjs
node tests/phase-note-layout.cjs
node tests/live-smoke.cjs
```

`PLAYWRIGHT_MODULE` can point at an existing Playwright installation. Cloud tests used `/opt/codex/cua_node/lib/node_modules/playwright` and `/usr/bin/chromium`; those are environment paths, not dependencies to copy into a local setup.

The cloud's HTTPS proxy caused Chromium certificate and Playwright direct-fetch failures during the live check. The successful check used curl to download the live JS, verified it against local release code, then served that downloaded source through the test route. `tests/live-smoke.cjs` supports `LIVE_ATELIER_FILE` for this fallback and `CLAY_IGNORE_HTTPS_ERRORS=1` only when required by a trusted test-environment proxy. Normal local use should need neither.

## Cloud workspace inventory

- `/workspace/clay-tactile`: active release checkout. Its eight previously dirty/untracked release files all match deployed main; the local checkout was aligned with main before making these handoff additions.
- `/workspace/virtual-clay-studio`: older rib-opening checkout. Every modified file matches commit `38cfb70459a46af2fb76c43ed35b9cab477cce30` in GitHub history.
- `/workspace/clay-workflow`: older workflow checkout. Every modified/untracked file matches saved GitHub history at `12848b70828852b4c0f351e067dc5a0ecdd23f47`, `bd7f6965f4d5d4f55d41ac2324db579a8b54a308`, or current main.
- `/workspace/clay-messages`: older note-placement checkout. Both modified files match `bd7f6965f4d5d4f55d41ac2324db579a8b54a308`.
- The uploaded `Pasted text.txt` lived under `/workspace/attachments/183e2e92-2ec8-4844-b7a5-441d8b9a4839/`. Its text is preserved in `docs/original-tool-brief.md` on the handoff branch.
- Cloud-only disposable helpers in `/tmp`: `tactile-edit.py`, `workflow-change.py`, `rib-opening-browser.cjs`, `workflow-browser.cjs`, `glaze-visual.cjs`, `clay-note-layout.cjs`, `tactile-live-smoke.cjs`. These are migration/debug helpers or earlier variants; recover the final implementation and maintained tests from GitHub instead. The useful final live-smoke helper is saved on the handoff branch.
- Cloud-only screenshots: `/tmp/materials-{320,390,430,1280}.png`, `/tmp/workflow-{320,390,430,1280}.png`, `/tmp/raised-note-{320,390,430,768,1280}.png`, `/tmp/glaze-finish-390.png`. They are not committed binary artifacts. The maintained browser tests regenerate the materials/workflow/raised-note screenshots in `/tmp`.
- Downloaded live HTML/JS/CSS in `/tmp` are verification copies, not edits. Browser profiles/caches and the running cloud server are ephemeral and need not be transferred.

No cloud-only source changes need patching onto main. Do not apply diffs from the old checkouts over the latest release.
