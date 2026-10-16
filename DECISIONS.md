# Studio decisions

## 2026-10-15 — Checkpoint 1: raw clay surface (awaiting review)

- Scope: raw surface only. No tool behavior, geometry/profile editing, Undo history, stages, thin walls or fired glaze behavior changed. Existing tiny geometric surface detail retained to avoid affecting contact geometry; the old regular bump-map rings are replaced on raw clay by irregular normal-map relief.
- Three shared 1024×1024 maps: normal for variable spacing/depth/wobble/fading rings and fine grain; roughness for broad soft variation; nearly neutral color for subtle mottling. Seamless horizontal wrap, one circumference, clamped height, mipmaps and up to 4× anisotropy. No repeating UV scale or per-frame generation.
- Dry clay roughness .98, zero dry specular intensity/clearcoat. Existing water response preserved; legacy maps restored outside Throwing. Glaze overlay and final-fire reveal unchanged.
- Initial procedural generation noticeably delayed throttled startup (~4.9s vs ~1.5s baseline). Baked the same maps into assets/raw-clay, removing runtime generation. Final readiness measurement: desktop 1130ms / phone proxy 1360ms versus baseline 3091ms /1497ms; these single runs are noisy and do not prove a speedup.
- Continuous rendering: median/p95 ~16.7ms before and after; 0% sampled frames >33.4ms. 180 RAF frames per run, first 10 discarded. Phone proxy: Chrome on Mac, 390×844, DPR2 capped by existing renderer at1.65, 4× CPU throttling. No browser errors. **No physical mid-range phone available; actual mobile GPU/thermal performance remains unverified.**
- Cost: ~4.6MB additional PNG downloads and ~16MiB uncompressed GPU texture storage with mipmaps. Slow-network load and low-memory phone cost must be considered before release.
- Validation: eight existing Node suites passed (water test fixture now includes maps and expects the new dry roughness); build and diff checks passed. Shaping/history code untouched.
- Evidence: docs/raw-clay-checkpoint-1/review.html, before/after desktop and phone PNGs including 2.6× close-ups, matching metrics JSON, deterministic map-generator.js.
- Stop here for user review. No deployment. No Checkpoint 2 or wall changes.

## 2026-10-15 — Checkpoint 2: lighting and environment (awaiting review)

- Original 512×256 studio-light image drawn at startup, PMREM-convolved once and shared with saved-piece rendering. Warm softbox reflection, dark warm surroundings; existing studio backdrop/UI retained.
- One directional key plus low hemisphere ambient, existing soft shadow map, ACES exposure .95. Removed additional directional fill/rim lights.
- Soft interior depth and groove cavity shading through existing vertex colors. This is approximate ambient occlusion, not screen-space or ray-traced AO. No added mesh positions/indices or per-frame postprocessing.
- No tool, history, phase, glaze material parameter or wall-thickness changes. Existing final-fire reveal retained. Checkpoints 3 and 4 are pending approval.
- Eight existing Node suites passed. Browser capture runs had no page errors; fired comparisons exercise first firing, coating, final firing and completion.
- Continuous rendering: desktop median/p95 16.7/16.7ms; phone proxy 16.7/16.8ms, zero sampled intervals >33.4ms. Before phone readiness1494ms, after1786ms (+292ms). Desktop after6038ms vs1379ms is a significant startup outlier, so startup overhead remains a release concern. Single-run timings are noisy. Textures9→10.
- Phone proxy uses Chrome on Mac at390×844, DPR2 capped1.65, CPU throttling4×; physical mid-range phone GPU/thermal behavior is unverified.
- Evidence: docs/lighting-checkpoint-2/review.html, matched raw/fired before/after and close-ups, metrics JSON and portable capture helpers. Raw captures use a deterministic opened clay/groove fixture.
- Stop for review. Nothing deployed.

## 2026-10-15 — Checkpoint 3: glaze and rim-lighting correction

- User authorized continuation through Checkpoint 4, without deployment.
- Found reversed triangle winding on rim and cavity floor. Corrected facing/normals without moving vertices; the rim no longer shades as a separate dark lid.
- Unfired glaze retains identifiable color but blends28% toward chalk, roughness.94, no clearcoat, restrained environment/specular. Fired Gloss roughness.13, clearcoat1, clearcoat roughness.12, environment intensity1.15. Satin and Matte preserve their existing roughness/coat identities.
- Added subtle default crest lightening; existing groove pooling and six optional effects retain their final-fire gating. No paint, history, phase, or shaping changes.
- Eight Node suites passed. Matched desktop and4× CPU-throttled390px phone proxy captures completed raw→bisque→glaze→finalfire with no page errors and finite geometry. Captures show actual reflected softboxes.
- Fired rendering proxy measured ~33.3ms median /33.4ms p95 both before and after (about30fps, not60). No measured incremental slowdown, but this heavier fired path is a mobile performance concern. Hardware GPU performance remains unverified.
- Evidence: docs/glaze-checkpoint-3/review.html and metrics.json. Local only.

## 2026-10-15 — Checkpoint 4: rounded lip and readable inner wall

- Rim uses a cosine radial sweep and bounded half-ellipse rise instead of linear flat bridging. Same five rim intervals, no extra triangles. Outer/inner endpoints and actual shaped wall thickness remain unchanged; minimum thickness guards remain intact. This makes an opened thin wall read with a rounded edge without forcibly widening a user-shaped neck.
- Rim color interpolates between the outer and inner surfaces. Interior floor center now shares the cavity floor's soft AO value rather than producing a bright triangular fan.
- Browser tests pass at390px and1280px: upward rim triangle winding for narrow/wide rims, finite positions/normals, unchanged shaping profile and history after mesh rebuild, final-fire reveal, all six effect shader configurations, return to matte preview. Previous tool browser tests passed scoop Undo/Redo, three ribs, Brush/Pour/Spray/Dip Undo. Eight Node suites and build passed.
- Phone4× CPU proxy fired median33.3ms/p9533.4ms before and after; desktop same. No added frame-time cost measured. These are headless Chrome proxy measurements, not real-device verification.
- Before/after raw, glazed, fired and2× close-up evidence: docs/walls-checkpoint-4/review.html. Regenerate with EVIDENCE_DIR=docs/walls-checkpoint-4 BASELINE=4bb5cd0 and docs/glaze-checkpoint-3/capture.cjs.
- Checkpoints3–4 complete locally; no deployment/push. Await visual review.

## 2026-10-15 — Raw-clay video-reference refinement

- Compared supplied19-04-38 and19-02-39 recordings (31.55s/24.535s) at multiple timestamps. Used actual decoded frames of throwing, trimming and smoothing, not the finished glazed-pot introduction.
- Three differences addressed only: (1) broad blurred marks versus fine close circular lines; (2) heavy all-over granular relief versus smooth clay with sparse pores; (3) stretched radial rim marks versus circular detail.
- Original procedural generator increases line frequency and reduces coarse noise/mottle relief, uses sparse pits rather than uniform white noise. Same1024-square maps, material hues and matte response. No reference image pixels used in runtime textures.
- Added separate uv1 raw texture coordinates: reserve85% for outer wall and15% for the rim, preserve original uv painting coordinates. Positions/indices, tool logic, process/history and lighting unchanged. Existing raw-map channel changes back with the legacy non-raw maps at firing.
- Assets now substantially smaller (normal~716KB, color~153KB); unchanged map dimensions/GPU texture count. Additional UV buffer is small and only updated during existing mesh rebuilds.
- Desktop and390px4× CPU phone proxy: median16.7ms, p95~16.8ms before/after, zero sampled intervals>33.4ms, no browser errors. Physical phone GPU/thermal behavior unverified. Eight Node regression suites passed.
- Evidence/generator/bake helper: docs/raw-clay-reference-review/. Reference frame copies are documentation only, never loaded by the app. Baseline a9d628d. Stop for review; no deployment.

## 2026-10-15 — Sponge tool checkpoint
- Sponge removes shallow local marks; carved marks deeper than .02 scene units retain at least70% of their original depth, with edge widths easing toward120%. Limits persist across repeated contacts and history snapshots. Full-ring cuts track removed depth and limit sponge refill to30%.
- Broad contour smoothing reduced from.12 to.035 per contact update. Rib compression/recovery unchanged. Carving remains available during Throwing; no simulated drying gate added.
- Eight Node suites passed, including new shallow/deep/full-ring and returning-from-Rib checks. Browser390/1280px: held contact, repeat contact and exact Undo/Redo passed with no errors. Build passed.
- Evidence: docs/sponge-tool-review/. Local only; no deployment.

## 2026-10-15 — Needle checkpoint
- Added Needle within Carve's existing tip selector; no new main tool or stage. Shallow local incisions (base depth.01, height radius.035, angle radius.045); bounded existing stroke sampling and depth controls. Tap/drag and keyboard paths use the local-cut engine. No piercing or rim removal.
- Existing Line/Scoop, all ribs and glaze method browser regressions passed at390/1280px. Needle actual drag creates narrow marks; exact Undo/Redo passed. Eight Node suites passed. Evidence in docs/needle-motion-review (shared with motion checkpoint).
- Local only; no deployment.

## 2026-10-15 — Motion-detail checkpoint
- Raw normal-map strength follows actual wheel speed with a smooth curve: .7 stopped → .315 at6rad/s. Uses existing map/uniforms, no new textures, geometry or postprocess. Fired phases are excluded. This reduces micro-relief contrast; it is not true temporal blur.
- Browser390/1280px verifies stop→medium→fast→stop strengths and exact unchanged profile/history. Needle actual drags and Undo/Redo passed; no page errors. Frame intervals around33.3/33.4ms median/p95 in this run, unthrottled desktop Chrome at phone/desktop viewport sizes. Real phone and throttled performance for this checkpoint remain unverified.
- Local review: docs/needle-motion-review/review.html, screenshots and results.json. Sponge, Needle, motion checkpoints saved separately. No deployment.

## 2026-10-15 — Connected opening and cylinder foundation
- Replaced fixed.62 interior-depth ceiling with available body height minus protected.22floor. Initial inner floor radius88% of mouth versus58%, giving a less conical cavity.
- Interior widening now propagates to outer rings with a soft transition below the floor. Supported wall target.14, existing.12minimum and body-size radius bounds retained. Reversing a thin-wall widening gesture can bring the wall inward; no upward displacement from widening. This remains simplified shape modeling, not a complete physical clay-volume solver for opening.
- Interior pointer action locks after initial direction: down deepens, sideways widens with reversible signed movement, up pulls connected Hands walls. Rib upward interior contact remains depth refinement, not wall pulling. Contextual Hands hint updates after opening.
- Hollow height changes use connected height weights rather than local upper-ring bunching; existing bounded changes and volume-balancing safeguards retained.
- Eight Node suites passed with additional5/10/15lb connected-wall/deep-opening/floor tests. Browser1280px and320/390/430px phone layouts passed opening, cylinder raise, Undo dimensions, no errors. Phone opening/pull uses CDP touch events at4×CPU throttle; initial low/wide preparation uses keyboard and finishing uses mouse. Not a physical-device or novice usability claim.
- Reference attempt now reaches open upright bowl, then cylinder, using normal controls. Evidence docs/connected-cylinder-review/review.html; prior unsuccessful evidence retained in docs/dog-bowl-attempt/. No material/UI layout changes. No deployment.
- Performance concern:390px/4×CPU held-Sponge sample (60RAF intervals) median16.7ms, p95150ms. This exposes intermittent slow geometry updates; mobile smoothness is not fully resolved and needs profiling before release. No claim that this patch caused or eliminated that cost.

## 2026-10-16 — Checkpoint preservation and milestone archive
- User policy: preserve every meaningful checkpoint in Git and keep review evidence under docs/. Only milestone-level screenshots, guides, reviews and handoffs belong in Drive.
- Existing ten material/tool/replication checkpoints remain separate commits through 170681b. Added docs/progression-20261016/ with an ordered, self-contained milestone review, 20 selected original screenshots, reproducible builder and SHA-256 source manifest. No scratch captures or source bundle uploaded.
- Reused existing Drive project journal and its 03 — Handoffs + checkpoints folder; preserved older master case study and field guide. Verified uploaded review metadata and all 20 embedded images in browser.
- Drive review: https://drive.google.com/file/d/11sOdjn1T6x-DlOT4sVQw942i31ywkpRA/view
- Explicitly records failed bowl, subsequent bowl/cylinder redo and unresolved held-Sponge mobile-proxy stutter. No physical-device claim, app changes or deployment.

## 2026-10-16 — Sponge resource reuse performance checkpoint
- Reuse interior mesh/material/geometry attributes during rebuilding; dispose when closing or resetting. Recompute normals and bounds; retain original equations and tools. Reuse outer raw UV attributes. Dry-color updates skip vertex/profile wetness searches and unchanged uploads.
- Isolated390px/4×CPU benchmark,40 sponge/render submissions: median93→40.6ms, p95384.1→65.3ms,40 material identities→1. Interior position/color hashes identical after equal sponge updates. These are CPU-side submission measurements, not real-phone GPU completion/FPS.
- Full interaction checks at320/390/430/1280, opening/pull/Undo; final390 rerun after dry-color optimization. Eight Node suites,390/1280 material lifecycle/effects checks and build passed.
- Performance remains a limitation: expensive updates still exceed16.7ms. Frame samples remain variable; no claim of eliminating mobile stutter. No physical device tested. Evidence and scripts: docs/sponge-performance-review/.
- Local Git checkpoint only, no deployment or Drive copy (incremental rather than milestone archive).
