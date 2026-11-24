import type { MetaballSpell } from "../src/Classification";

declare const definition: Omit<MetaballSpell, "color">;
const valid: MetaballSpell = { ...definition, color: "red" };
// @ts-expect-error Metaball spell definitions must include a color.
const missingColor: MetaballSpell = definition;
void valid;
void missingColor;
