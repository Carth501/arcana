import type { Matrix } from "ml-matrix";
import { detectMetaballSpells, type MetaballSpell } from "./Classification.ts";

const SLICE_RADIUS = 3;
const SAMPLE_STEP = 0.5;
const FALLBACK_COLOR = "#808080";

interface SliceSample {
	x: number;
	y: number;
	matches: MetaballSpell[];
}

function resolveAxes(count: number, x: number, y: number): [number, number] | null {
	if (count < 2) return null;
	const xAxis = Number.isInteger(x) && x >= 0 && x < count ? x : 0;
	const yAxis =
		Number.isInteger(y) && y >= 0 && y < count && y !== xAxis ? y : xAxis === 0 ? 1 : 0;
	return [xAxis, yAxis];
}

function sampleSlice(
	matrix: Matrix,
	xAxis: number,
	yAxis: number,
	spells: MetaballSpell[],
): SliceSample[] {
	const count = matrix.rows * matrix.columns;
	if (
		!Number.isInteger(xAxis) ||
		!Number.isInteger(yAxis) ||
		xAxis < 0 ||
		yAxis < 0 ||
		xAxis >= count ||
		yAxis >= count ||
		xAxis === yAxis
	) {
		throw new RangeError("Slice axes must be two distinct matrix entries");
	}

	const xRow = Math.floor(xAxis / matrix.columns);
	const xColumn = xAxis % matrix.columns;
	const yRow = Math.floor(yAxis / matrix.columns);
	const yColumn = yAxis % matrix.columns;
	const currentX = matrix.get(xRow, xColumn);
	const currentY = matrix.get(yRow, yColumn);
	if (!Number.isFinite(currentX) || !Number.isFinite(currentY)) {
		throw new RangeError("Slice coordinates must be finite");
	}

	const samples: SliceSample[] = [];
	for (let y = -6; y <= 6; y++) {
		for (let x = -6; x <= 6; x++) {
			const xValue = currentX + x * SAMPLE_STEP;
			const yValue = currentY + y * SAMPLE_STEP;
			const candidate = matrix.clone();
			candidate.set(xRow, xColumn, xValue);
			candidate.set(yRow, yColumn, yValue);
			const matches = spells.filter(
				(spell) => detectMetaballSpells(candidate, [spell]).length > 0,
			);
			samples.push({ x: xValue, y: yValue, matches });
		}
	}
	return samples;
}

function isProjectedOriginVisible(x: number, y: number): boolean {
	return Math.abs(x) <= SLICE_RADIUS && Math.abs(y) <= SLICE_RADIUS;
}

function spellColor(spell: MetaballSpell): string {
	return spell.color === undefined ? FALLBACK_COLOR : spell.color;
}

function blendColors(colors: string[]): string {
	if (colors.length === 0) return "var(--code-bg)";
	return colors
		.slice(1)
		.reduce(
			(mixed, color, index) =>
				`color-mix(in srgb, ${mixed} ${((index + 1) / (index + 2)) * 100}%, ${color})`,
			colors[0],
		);
}

export { blendColors, isProjectedOriginVisible, resolveAxes, sampleSlice, spellColor };
export type { SliceSample };
