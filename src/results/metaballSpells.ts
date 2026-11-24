import { Matrix } from "ml-matrix";
import type { MetaballSpell } from "../Classification";

export const metaballSpells: MetaballSpell[] = [
	{
		name: "Arcane Bridge",
		threshold: 0.9,
		color: "rgb(205, 49, 49)",
		centers: [
			{
				position: new Matrix([
					[1, 3],
					[2, 1],
				]),
				scale: new Matrix([
					[2, 4],
					[2, 2],
				]),
			},
			{
				position: new Matrix([
					[1, 4],
					[2, 1],
				]),
				scale: new Matrix([
					[1, 2],
					[1, 1],
				]),
			},
			{
				position: new Matrix([
					[1, 5],
					[2, 1],
				]),
				scale: new Matrix([
					[3, 1],
					[3, 3],
				]),
			},
		],
	},
	{
		name: "Quiet Spark",
		threshold: 0.5,
		color: "rgb(233, 237, 28)",
		centers: [
			{
				position: new Matrix([
					[3, 0],
					[0, 0],
				]),
				scale: new Matrix([
					[1, 2],
					[1, 1],
				]),
			},
		],
	},
];
