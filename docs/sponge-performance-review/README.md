# Sponge performance checkpoint — October 16, 2026

Baseline: a57ca95. Local only. No deployment.

## Finding and change
Every rebuild discarded the interior geometry and cloned its material. Reuse the interior mesh, geometry attributes, index and material while updating positions, colors, normals and bounds. Closing/resetting still disposes the interior. Outer raw UV buffers are reused too. Dry colors bypass the per-vertex profile search and redundant unchanged uploads; wet clay keeps the original calculation.

No smoothing strength, contact timing, floor protection, tool semantics, process or history changes.

## Evidence
- profile.cjs compares baseline/current at 390px and 4× CPU throttling, 40 equal sponge updates plus synchronous render submissions.
- Final isolated run: median 93.0 → 40.6ms; p95 384.1 → 65.3ms. Interior materials: 40 → 1. Position/color SHA-256 identical after equal updates.
- These submission costs are not full GPU completion time or real-device FPS. Timing is noisy, and even 40.6ms exceeds a 60fps frame budget.
- workflow.cjs exercises real controls through low/wide clay, opening, rib, sponge, cylinder pull and Undo. Phone opening/pull uses CDP touch at 4×CPU; preparation uses keyboard and finishing uses mouse.
- after-320/430/1280 screenshots/results were captured after resource reuse, before the final dry-color upload shortcut; after-390 is rerun on the final version. See each JSON for frame samples. Do not claim all stutter is resolved.
- Material browser checks passed at390/1280: normal winding, finite geometry, unchanged profile/history, firing reveal and six effects.
- Eight Node regression suites and build passed. No physical phone was tested.

This is incremental performance work, not a milestone requiring Drive duplication. Full evidence remains here in Git.
