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
