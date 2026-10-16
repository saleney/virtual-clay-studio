# Moon jar — real UI attempt, October 16, 2026

Research/test only. No application source edits made during this attempt. Existing unfinished control-dock/framing edits were already in the working tree and are the UI tested; they are not an approved release. Baseline committed application: 5baa14a plus those earlier local edits.

## Method
One piece, porcelain, 10 lb; wheel left at4.4. Desktop in-app browser1089×779. Only visible buttons, actual pointer drags and held clicks. No injected profile, app-state helpers, keyboard shaping, synthetic geometry, or edited screenshots. One Undo recovered a pinched lower wall. No firing, glazing or saved shelf piece.

## Step record (screen pixels; each file is the actual UI screenshot)
1. 01-start.png: select Porcelain,10lb.
2. 02-open.png: Hands(542,211)→(542,318), open center.
3. 03-mouth.png: deepen(542,207)→(542,322); widen(542,207)→(601,207).
4. 04-belly-first.png: Hands(677,322)→(730,322). Belly expands but makes a horizontal bulge.
5. 05-lower-shaping.png: outward(682,352)→(718,352); inward(674,391)→(642,391). Little visible response relative to first pull.
6. 06-hands-shoulder.png: inward shoulder(650,252)→(606,252). Limited visible change.
7. 07-rib-shoulder.png: select Wood Rib;(647,261)→(598,252). More defined short neck/shoulder.
8. 08-rib-waist-failure.png: Rib(664,392)→(614,402). Abrupt pinched waist, not rounded underside.
9. 09-foot.png: Undo once; Hands(646,427)→(604,427).
10. 10-sponge-belly.png: Sponge held4seconds at(648,358). Smooths the band into a rounder belly.
11. 11-sponge-lower.png: Sponge held4seconds at(635,410). Removes lower rings; base still broad.
12. 12-foot-tuck.png: Hands(629,436)→(571,436). Low inward drag reduces the footprint.
13. 13-result.png: Hands(614,427)→(570,427). Further modest foot reduction.

## Outcome — partial, not success
Rounded upper belly and short neck achieved; widest region around the middle/upper middle. Mouth appears roughly120px across versus330px belly (~36%) in this perspective screenshot, not a world-space measurement. Foot remains broad (~70% of belly by visual estimate), lower portion is not a continuous near-sphere, and rim is heavy. Do not present this as a completed faithful moon jar or proof of even walls.

## What worked
Opening/deepening/widening were discoverable with the hint. Wood Rib successfully defined the shoulder. Sponge's4second holds visibly softened broad transitions without flattening the whole form. Low Hands gestures reduced the foot. Undo recovered the bad rib gesture.

## Where it resisted
Hands gestures had uneven perceived strength depending on contact position; upper inward move barely changed the shoulder while Rib responded. Lower Rib produced a sharp waist. Foot reduction needed low targeting and several attempts. The fixed camera does not expose hidden interior thickness.
Code inspection (read-only): setInterior creates9 rings with floor radius88% of mouth radius; reconcileInterior clamps each inner radius below the outside at that height by.12 scene units. A narrow-mouth cavity is not automatically a matching round-bellied cavity, and this radial gap does not establish thickness perpendicular to a curved wall. These are implementation findings, not measured thickness of this UI-created piece.
No obvious collapse or explosive jump occurred. No visible message explained whether a weak move was limited by a safeguard or by gesture interpretation. Cannot attribute each weak move to a particular guard from screenshots alone.
The blanket claim that Rib/Sponge pull everything into a straight cylinder was NOT supported here: both helped the upper curve. The lower section remained column-like until targeted foot work.

## First-time discoverability
An informed operator succeeded partially, not a novice study. Opening hint useful; after opening, Hands hint only discusses inside gestures even when shaping outside. Nothing explains low contact for the foot, shoulder closing, or why a drag is weak. Sponge hold instruction matched observable behavior. This route currently requires trial, Undo and knowledge of the target silhouette.

## Options, ascending risk — proposals only
1. Feedback and optional guidance (low). Contextual outside/inside instructions and affected-region/limit feedback. Optional hideable faint target outline, without snapping or autofitting. Hands/Rib/Sponge mechanics unchanged. Improves discovery, not underlying geometry.
2. Curved-wall coordination (medium). Local shoulder closing that preserves belly, and more predictable low-foot shaping; coordinate inside/outside changes while retaining guards. Hands upper/low shaping would change; Rib compression would need curvature-preserving tuning; Sponge initially unchanged.
3. Curvature-aware shell model (high). Replace radius-only protection with an interior following the curved shell, including neck/shoulder/floor junctions. Hands and Rib would feel different as constraints change; Sponge must be revalidated/reworked to preserve shell thickness. Requires broad shape/history/performance regression work.

Research context: museum moon jars are often made from joined hemispheres. This remained a one-piece test as requested, not a claim to replicate that construction.
Sources:
https://www.metmuseum.org/ko/perspectives/full-moon-jar
https://collection.powerhouse.com.au/object/823977

Stop here. No proposed option implemented.
