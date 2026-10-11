# Virtual Clay Studio — four-lens design QA

October 11, 2026. Reviewed local checkpoint 7c865b3. No production changes.

## Scope and evidence

Inspected current HTML/CSS, state transitions and tool logic. Walked mobile Brush → Water → first firing → glaze selection → final firing → New clay in a 390×844 browser frame, and inspected desktop at 1280×844. Read computed target sizes and typography. This is an expert heuristic review, not observed participant research or physical iPhone/iPad testing. Earlier function regression suites and responsive firing checks support mechanical claims; this audit does not establish real-device performance or usability for every age.

## Independent critiques

| Element | UX designer | UI designer | Game designer | Ceramics perspective |
|---|---|---|---|---|
| Entry / clay size | Direct manipulation is inviting. Hands hint explains lift/width, but not making an opening. Weight choices presume familiarity. | Clay is the focal object; no opaque header obstruction. Mobile text is much smaller than the object. | Immediate sandbox, no mandatory tutorial. Opening a vessel needs a discoverable first success. | Weight changes are a useful approximation; the displayed lb values are not a calibrated physical mass simulation. |
| Hands | Sidewall shaping is understandable. Center-down opening is a different gesture and is missing from the Hands hint. | Direct contact and soft surface support material believability. | Local alterations and symmetry give experiments a visible result. Beginners may never discover bowls. | Real throwing uses supported, coordinated pressure; screen drag to change a radial profile abstracts that technique. |
| Rib | Directional pressure is clearer than a fixed target line. Its opening capability is unfamiliar to novices. | Oriented narrow contact differentiates it from Hands, but gradual changes can be subtle. | Bounded strokes plus smoothing make it forgiving. Distinction from Sponge needs visible response. | Ribs shape and compress supported walls and smooth throwing rings; the bounded profile response is an approximation. A single drag that opens the center replaces more involved real technique. |
| Carve | Shallow default plus optional Width/Depth reduce overload. Orientation and wheel speed still produce different results that need discovery. | Knife icon is recognizable; shared clay shading can make cuts difficult to read at low contrast. | Spinning creates spirals; pause enables intentional placement. Depth caps reduce accidental destruction. | Carving is commonly performed after clay firms to leather hard; continuously carving freshly thrown wet clay simplifies timing. |
| Sponge | Hold-to-smooth hint is useful. Recovery is gradual, not a one-tap eraser. | Soft contact differs from the knife. Progress is subtle, especially with a finger covering the mark. | Offers an in-world recovery path alongside Undo. Existing regression checks show local groove reduction while distant marks persist. | A damp sponge smooths and cleans, but a deep incision is removed by working surrounding clay, not simply restoring missing material. Digital groove healing is deliberately more forgiving. |
| Brush | Material choices appear only when relevant. One icon spans Water, Slip, then Glaze; names carry much of the distinction. | Good progressive disclosure. Mobile Water/Slip tray is relatively prominent compared with tiny text elsewhere. | Painting extends the creative loop without another complicated toolset. | Application to the rotating vessel is a useful simplification; coating thickness and drying are abstracted. |
| Water | Hidden under Brush is reasonable for infrequent use. Water does not join Undo history, unlike shaping and paint. | Splash/wetness distinguishes it from slip; wetness is temporary. | Softening adds responsiveness; a timed effect may be hard to notice without comparing pressure. | Water lubricates and changes workability; the implementation wets a profile band rather than simulating local surface moisture and absorption. |
| Slip | Color choice is clear, but a newcomer may not distinguish slip from glaze. | Earth-toned palette belongs to the studio. Color overlaps with body can make coverage subtle. | Decoration before carving enables sgraffito-like play. | Slip is clay suspended in water. Matching body/stage and drying matter in real application; those constraints are omitted. |
| Glaze | Selected name plus visible hue helps expectation. Matte → gloss teaches finishing. A user can fire without painting: valid for unglazed work, not a failure. | Matte coating remains recognizable; fired gloss reads as a reward. All eight glazes share one glossy fired response. | Predictable colors support creative intent. Repeated coats provide control, though the distinction between choosing a swatch and applying it is learned by touching. | Raw glaze color can differ from fired color. The preview intentionally favors predictability. Not all fired glazes are glossy; matte and satin surfaces are also real. |
| Process labels | Desktop shows all four stages. Mobile shows only current stage, concealing the upcoming second firing. Labels alone do not explain why shaping becomes unavailable after fire. | Quiet top-right placement preserves focus. Mobile step name is legible only with close attention. | Short automatic transitions preserve flow; no unnecessary wait-based challenge. | Common two-firing workflow is represented, but drying, heating schedules and cooling are compressed into a few seconds. |
| Fire it | Available immediately; automatic transition to glaze avoids a redundant click. It crosses a history boundary without advance notice. | Strong filled action communicates commitment. | A clear milestone. Players may fire experimentally and then discover shaping is gone. | Bisque prepares a durable, porous body for glazing. Actual drying and kiln time are absent. |
| Fire to save | Now leads to one New clay action. The label emphasizes saving more than the second kiln step. | Matte-to-glassy reveal is materially specific; a subtle wash stands in for kiln activity. | Finish/save gives closure and a collectible artifact. | Second firing melts the glaze; the instant uniform finish is simplified. |
| New clay / Reset | Confirmed: New clay retains Brush and prior Water selection. A second piece can feel unresponsive because the user is wetting rather than shaping. Reset also discards work without a recovery step. | Button layout is stable, but selection does not match an expected fresh throwing state. | Starting another round should feel immediately playable. Retained material/tool creates a trap in the repeat loop. | Starting a fresh piece would ordinarily mean returning to forming actions; prior tool preference is possible but not a required practice. |
| Shelf / saved work | Code silently retains only six pieces; oldest is removed on a seventh save. Storage errors are caught but success status still promises saving. Images are not editable pieces. | Object thumbnails and a separate shelf avoid crowding the wheel. | A collection reward loses trust if older creations disappear without notice. | A gallery of finished work is appropriate. Glaze again reopens the digital coating; real refiring applies a new treatment to already fired material, rather than reverting it to raw glaze. |

## Findings worth addressing before a broader release

1. High: make a second piece start predictably; observed Brush/Water retention can look like broken shaping.
2. High: align shelf promises with six-piece retention and actual storage success. Do not silently lose older work under an unlimited-sounding shelf promise.
3. Medium: mobile action labels are 8px despite 44px-high buttons. Undo/Redo labels are 9px; hints and glaze name are 10px. Touch size and reading size are separate issues.
4. Medium: Hands lacks the center-down opening hint; this is essential to discovering a vessel rather than only a solid form.
5. Medium: mobile conceals future process steps; final firing is followed successfully, but the full sequence is not explained by the initial view.
6. Medium: firing ends shaping Undo; Reset removes work. A compact preview of the consequence could protect experimentation without mandatory confirmation dialogs.

## Preserve

Cozy shelves and warm light, fixed wheel/pan, large central clay, direct touch, five differentiated icons, context-specific materials, optional carving controls, local smoothing, recognizable glaze hues and fired finish reveal. The primary design issue is readability and predictability, not adding more controls.

## Ceramics references

- [Rib compression, carving and smoothing example](https://ceramicartsnetwork.org/pottery-making-illustrated/pottery-making-illustrated-article/Thrown-Altered-and-Carved)
- [Leather-hard clay](https://digitalfire.com/glossary/leather+hard)
- [Ceramic slip](https://digitalfire.com/glossary/ceramic+slip)
- [Bisque and the two-firing process](https://digitalfire.com/glossary/bisque)
- [Glaze thickness and fired appearance](https://www.digitalfire.com/glossary/glaze%2Bthickness)

These perspectives intentionally remain separate. No finding was implemented as part of this audit.
