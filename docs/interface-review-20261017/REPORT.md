# Virtual Clay Studio — interface review

## Start here (3–5 minutes)
Salene is building a playful pottery studio and learning product/interface terminology along the way. The clay and wheel are the main experience. The interface is still a work in progress; we would value an independent designer's view rather than a full audit.

- [Studio](https://saleney.github.io/virtual-clay-studio/)
- [Live phone-width preview](https://saleney.github.io/virtual-clay-studio/docs/desktop-controls-20261017/mobile.html) — a390px frame, not a substitute for trying a real phone.
- [Interactive terminology guide](https://saleney.github.io/virtual-clay-studio/docs/interface-guide/)

Try choosing clay, shaping it briefly, firing it, and selecting a glaze. On desktop, open Customize glaze. No account required. Finished pieces stay in that browser.

## Three questions
1. **Attention:** Does the clay feel like the focus? Point to the first control or space that distracts you or gets in the way.
2. **Understanding:** Which control would you hesitate to use without an explanation? What did you expect it to do?
3. **Grouping:** Which controls belong together, and what one layout change would improve the experience most?

A screenshot with two or three notes is plenty. Please include device/browser and approximate window width. No need to read the development history or propose a complete redesign.

## Current direction
- Phone controls sit below a protected clay region. The dock fits its contents instead of reserving an empty block.
- Clay families stay in one row. Tool hints are brief, without repeating the tool name. Related gaps are small;13px phone labels are an explicit user choice, with44px targets and16px native fields.
- Phone settings replace dock contents and offer Back. Glaze effects use two columns.
- Desktop Undo/Redo sit left of wheel speed. Customize glaze, Dip whole piece and brush controls share a row. Customize glaze opens a modal dialog instead of expanding that row.

## Open questions, not settled conclusions
- Is the balance between compact controls and readable type right on actual phones?
- Does switching from the phone dock to a desktop side palette feel coherent?
- Are tool selection, settings, and stage progression easy to discover?
- How much guidance helps a new potter without crowding the work area?

The latest layout is a candidate for review, not a claim that the interface is finished. User dissatisfaction is useful evidence about the product; this review is not an assessment of the user's design ability.

## Scope boundary
Review the interface, grouping, clarity and use of space. Clay/tool physics, the four process stages, Undo history, final-firing reveal and browser-local shelf storage are intentionally preserved. Recommendations about those can be noted separately.

## Implementation / evidence (optional)
Recent work is preserved in Git and DECISIONS.md. Current screenshots and checks live in ../desktop-controls-20261017/ and ../checkpoint-b-phone-dock/. These are browser-engine checks, not physical-device performance certification. Screenshots document iterations, so use the live studio for current behavior.

## Validation — October17
Final real-browser studio matrix passed in Chromium and WebKit at320,390,430 and1280px; desktop row alignment and unchanged toolbar bounds while the modal is open were checked separately. Guide interactions passed in both engines at320/1280px. All eight regression suites passed. Logs and screenshots are preserved locally in these documentation folders. This does not establish that the interface is intuitive for first-time users; that is why we are requesting human review.
