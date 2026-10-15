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
