import { Matrix } from "ml-matrix";
import type { Spell } from "../Classification";

export const ellipsoidSpells: Spell[] = [
	{
		name: "Novice's Flickerflare",
		color: "rgb(255, 132, 0)",
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
		color: "rgb(65, 162, 255)",
		position: new Matrix([
			[-1, 0],
			[0, -2],
		]),
		scale: new Matrix([
			[0.3, 0.7],
			[1.3, 0.8],
		]),
	},
];
