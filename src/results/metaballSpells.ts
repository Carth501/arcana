import { Matrix } from "ml-matrix";
import type { MetaballSpell } from "../Classification";

export const metaballSpells: MetaballSpell[] = [
	{
		name: "Arcane Bridge", // ssytqda
		threshold: 0.9,
		color: "rgb(205, 49, 49)",
		centers: [
			{
				position: new Matrix([
					[1, 8],
					[2, 1],
				]),
				positive_radius: new Matrix([
					[2, 1],
					[5, 2],
				]),
				negative_radius: new Matrix([
					[2, 4],
					[10, 3],
				]),
			},
		],
	},
	{
		name: "Quiet Spark", // syfusH
		threshold: 0.5,
		color: "rgb(233, 237, 28)",
		centers: [
			{
				position: new Matrix([
					[3, 0],
					[0, 0],
				]),
				positive_radius: new Matrix([
					[1, 2],
					[1, 1],
				]),
				negative_radius: new Matrix([
					[1, 2],
					[1, 1],
				]),
			},
		],
	},
];
