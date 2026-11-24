import { Matrix } from "ml-matrix";

interface Spell {
	name: string;
	position: Matrix;
	scale: Matrix;
}

function flattenMatrix(matrix: Matrix): number[] {
	return matrix.to2DArray().flat();
}

function detectSpell(matrix: Matrix, position: Matrix, scale: Matrix): boolean {
	const m = flattenMatrix(matrix);
	const p = flattenMatrix(position);
	const s = flattenMatrix(scale);

	const sum = m.reduce((acc, val, i) => {
		return acc + Math.pow((val - p[i]) / s[i], 2);
	}, 0);

	return sum <= 1;
}

function detectResult(matrix: Matrix, spells: Spell[]): string | null {
	for (const spell of spells) {
		if (detectSpell(matrix, spell.position, spell.scale)) {
			return spell.name;
		}
	}
	return null;
}

export { detectResult, detectSpell };
export type { Spell };
