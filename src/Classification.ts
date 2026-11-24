import { Matrix } from "ml-matrix";

interface Spell {
	name: string;
	color: string;
	position: Matrix;
	scale: Matrix;
}

interface MetaballCenter {
	position: Matrix;
	scale: Matrix;
}

interface MetaballSpell {
	name: string;
	color: string;
	centers: MetaballCenter[];
	threshold: number;
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

function detectMetaballSpells(
	matrix: Matrix,
	spells: MetaballSpell[],
): string[] {
	const matches: string[] = [];

	for (const spell of spells) {
		if (!Number.isFinite(spell.threshold) || spell.threshold <= 0) {
			throw new RangeError(
				`Metaball spell "${spell.name}" must have a positive finite threshold`,
			);
		}
		if (spell.centers.length === 0) {
			throw new RangeError(
				`Metaball spell "${spell.name}" must have at least one center`,
			);
		}

		let field = 0;
		for (const { position, scale } of spell.centers) {
			if (
				position.rows !== matrix.rows ||
				position.columns !== matrix.columns ||
				scale.rows !== matrix.rows ||
				scale.columns !== matrix.columns
			) {
				throw new RangeError(
					`Metaball spell "${spell.name}" matrices must match the input dimensions`,
				);
			}

			let distanceSquared = 0;
			for (let row = 0; row < matrix.rows; row++) {
				for (let column = 0; column < matrix.columns; column++) {
					const value = matrix.get(row, column);
					const center = position.get(row, column);
					const radius = scale.get(row, column);
					if (!Number.isFinite(value) || !Number.isFinite(center)) {
						throw new RangeError(
							`Metaball spell "${spell.name}" requires finite coordinates`,
						);
					}
					if (!Number.isFinite(radius) || radius <= 0) {
						throw new RangeError(
							`Metaball spell "${spell.name}" requires positive finite radii`,
						);
					}
					distanceSquared += ((value - center) / radius) ** 2;
				}
			}
			field += Math.max(0, 1 - distanceSquared) ** 2;
		}
		if (field >= spell.threshold) {
			matches.push(spell.name);
		}
	}

	return matches;
}

function detectSpells(
	matrix: Matrix,
	spells: Spell[],
	metaballSpells: MetaballSpell[],
): string[] {
	const result = detectResult(matrix, spells);
	return result === null
		? detectMetaballSpells(matrix, metaballSpells)
		: [result];
}

export { detectMetaballSpells, detectResult, detectSpell, detectSpells };
export type { MetaballCenter, MetaballSpell, Spell };
