import type { MetaballSpell, Spell } from "../src/Classification";

declare const definition: Omit<MetaballSpell, "color">;
const valid: MetaballSpell = { ...definition, color: "red" };
// @ts-expect-error Metaball spell definitions must include a color.
const missingColor: MetaballSpell = definition;
void valid;
void missingColor;

declare const ellipsoidDefinition: Omit<Spell, "color">;
const validEllipsoid: Spell = { ...ellipsoidDefinition, color: "blue" };
// @ts-expect-error Ellipsoid spell definitions must include a color.
const ellipsoidMissingColor: Spell = ellipsoidDefinition;
void validEllipsoid;
void ellipsoidMissingColor;
