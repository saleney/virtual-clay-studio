# Original sculpting-tool and materials brief

User-provided design brief from this session. The implemented release and remaining limitations are documented in HANDOFF.md.

Before changing anything, tell me in plain language what each sculpting tool (Hands, Brush, Carve, Sponge, Rib) and each material (Water, Slip, Glaze) currently does in the code.
Then make two changes:
1. Rename the final save/glaze-finishing button to 'Fire to save' (it's the second firing, after glazing, that permanently sets the glaze). Keep the first firing button as 'Fire it' so the two read as distinct steps.

Button copy: The final step after glazing currently needs a clearer label. Rename it to 'Fire to save' instead of whatever it currently says, since this is the second firing that permanently sets the glaze. If the first firing button (before glazing) is also just labeled 'Fire it,' keep that one as-is — the two should read as clearly different actions ('Fire it' first, 'Fire to save' second).


Fire to save" is the better choice, and not just because it's accurate — it's a stronger piece of copy than something generic like "Save piece" for the same reason "Open the little window" and "fired in a very small kiln" work: it ties the action to the actual physical process instead of app-generic language. "Save" is what every app button says. "Fire to save" teaches the person, in three words, that firing is what makes the glaze permanent — which is true, and most people don't know that.
One small thing worth deciding alongside it: if "Fire to save" becomes the final action, does the earlier "Fire it" button (between throwing and glazing) need its own distinct label so the two firings don't read as the same action? Something like "Fire it" (first, bisque) and "Fire to save" (second, final) would make the two-firing structure legible without needing to explain ceramics to the user — the labels would teach it

1. Reorder the sculpting tool rail to: Hands, Rib, Carve, Sponge, Brush — matching real pottery workflow (shape, compress, carve detail, smooth, then apply material). Display order only, don't change what each tool does.

Sculpting tools:
* Hands — the foundational tool. Broad, soft pressure; pushes and pulls the wall outward/inward, raises height, centers the form. Low precision, large area of effect — this is "basic shaping," the one you'd reach for most.
* Rib — a real pottery rib is a flat, firm tool used to compress and straighten the wall after hands have roughed in the shape. It should create cleaner, crisper curves and sharper transitions than Hands can — pressing the clay firmer and smoother, not just moving it. Think: the tool that makes a wobbly shape look intentional.
* Carve — used once a form exists, not while raising it. Should remove material rather than push it — cutting grooves, lines, facets, trimming a foot. Crisp negative detail, not soft deformation.
* Sponge — real sponges smooth, soften edges, and clean up tool marks. Should even out high-frequency bumps and round sharp transitions left by Hands or Carve — the "polish" step, not a shaping step.
* Brush — in actual pottery, a brush isn't for shaping clay at all, it's for applying something. This one probably shouldn't deform the mesh at all — it should be the applicator for whichever material is selected (Water, Slip, Glaze), painting that material onto the surface where you drag it.
Materials:
* Water — re-wets and softens an area that's gotten stiff, making it briefly easier to shape again. Functional, not decorative.
* Slip — liquid clay for color, applied via Brush, reading as part of the material (you already confirmed this) — should blend rather than coat.
* Glaze — applied after the first fire, should look visually distinct from Slip: glossier, slightly built-up rather than absorbed. Here's the detail I'd actually push for, because it's real and beautiful: glaze pools and darkens inside carved grooves. If Carve already creates recessed geometry, letting Glaze collect and read darker there for free would be a gorgeous, technically-accurate emergent effect — the kind of detail that makes something feel real instead of generic.
Worth testing against what's actually coded — if any of these already match, great; if not, this is a real spec to build toward.

Sculpting tools (current order is Hands, Brush, Carve, Sponge, Rib — I'd change it):
1. Hands — first, always. You can't carve or compress a form that doesn't exist yet.
2. Rib — right after Hands, not last. In real throwing, you rough the shape with your hands, then immediately firm and straighten the wall with a rib before it has a chance to slump. Putting Rib at the end (where it sits now) misrepresents when a potter would actually reach for it.
3. Carve — once the basic form is compressed and holding, now you can cut detail into it without collapsing the shape.
4. Sponge — last of the shaping tools. Cleanup and smoothing happen after carving, not before — you're removing tool marks and softening transitions as a final pass.
5. Brush — separate from the four above conceptually, since it doesn't shape at all. It's the applicator, used at two different points in the larger process (slip before the first fire, glaze after) rather than grouped with the sculpting tools.
Materials, matching the actual Throw → Fire → Glaze → fire-to-save sequence:
1. Water — used throughout shaping, not a discrete step — keeps clay workable the whole time you're using Hands/Rib/Carve/Sponge.
2. Slip — applied before the first fire, since it's clay-based and fires together with the body (matches what you told me — it blends into the material).
3. Glaze — only available after "Fire it," applied before "Fire to save" — this one could even be disabled/greyed out until the first fire happens, which would teach the sequence just through what's clickable.


