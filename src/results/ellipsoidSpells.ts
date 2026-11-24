import { Matrix } from "ml-matrix";
import type { Spell } from "../Classification";

export const ellipsoidSpells: Spell[] = [
	{
		name: "Novice's Flickerflare",
		position: new Matrix([
			[6, 5.8],
			[4, 4.5],
		]),
		scale: new Matrix([
			[1.3, 1.5],
			[1.6, 1.8],
		]),
	},
	{
		name: "Frostbolt",
		position: new Matrix([
			[-1, 0],
			[0, -1],
		]),
		scale: new Matrix([
			[0.3, 0],
			[0, 0.3],
		]),
	},
];
