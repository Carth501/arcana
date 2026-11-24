import assert from "node:assert/strict";
import test from "node:test";
import { Matrix } from "ml-matrix";
import {
	blendColors,
	isProjectedOriginVisible,
	resolveAxes,
	sampleSlice,
	selectAxis,
} from "../src/sliceSampling.ts";

const makeSpell = (name, center, color) => ({
	name,
	color,
	threshold: 0.5,
	centers: [
		{
			position: new Matrix(center),
			positive_radius: new Matrix(center.map((row) => row.map(() => 1))),
			negative_radius: new Matrix(center.map((row) => row.map(() => 1))),
		},
	],
});

test("samples a 13 by 13 window centered on the current fractional position", () => {
	const matrix = new Matrix([
		[1.2, -0.3],
		[7, 9],
	]);
	const samples = sampleSlice(matrix, 0, 1, [], []);
	assert.equal(samples.length, 169);
	assert.deepEqual(samples[0], { x: 1.2 - 3, y: -0.3 - 3, matches: [] });
	assert.deepEqual(samples[84], { x: 1.2, y: -0.3, matches: [] });
	assert.deepEqual(samples[168], { x: 1.2 + 3, y: -0.3 + 3, matches: [] });
	assert.equal(samples[1].x - samples[0].x, 0.5);
	assert.deepEqual(matrix.to2DArray(), [
		[1.2, -0.3],
		[7, 9],
	]);
});

test("holds unselected dimensions fixed and preserves overlapping spell identities", () => {
	const matrix = new Matrix([
		[0, 0],
		[4, 0],
	]);
	const first = makeSpell(
		"same name",
		[
			[0, 0],
			[4, 0],
		],
		"red",
	);
	const second = makeSpell(
		"same name",
		[
			[0, 0],
			[4, 0],
		],
		"blue",
	);
	const otherPlane = makeSpell(
		"other plane",
		[
			[0, 0],
			[0, 0],
		],
		"green",
	);
	const samples = sampleSlice(matrix, 0, 1, [first, second, otherPlane], []);
	assert.deepEqual(samples[84].matches, [first, second]);
	assert.deepEqual(samples[0].matches, []);
	assert.deepEqual(matrix.to2DArray(), [
		[0, 0],
		[4, 0],
	]);
});

test("slice sampling shows asymmetric radii on the selected axis", () => {
	const matrix = new Matrix([
		[0, 0],
		[0, 0],
	]);
	const spell = makeSpell("asymmetric", matrix.to2DArray(), "red");
	spell.threshold = 0.5625;
	spell.centers[0].positive_radius.set(0, 0, 2);
	const samples = sampleSlice(matrix, 0, 1, [spell], []);
	assert.deepEqual(samples[86].matches, [spell]);
	assert.deepEqual(samples[83].matches, [spell]);
	assert.deepEqual(samples[82].matches, []);
});

test("projected origin is visible on the boundary of the square", () => {
	assert.equal(isProjectedOriginVisible(3, -3), true);
	assert.equal(isProjectedOriginVisible(3.01, 0), false);
	assert.equal(isProjectedOriginVisible(0, -3.01), false);
});

test("axis choices remain distinct and in bounds as dimensions change", () => {
	assert.deepEqual(resolveAxes(4, 2, 3), [2, 3]);
	assert.deepEqual(resolveAxes(2, 2, 3), [0, 1]);
	assert.deepEqual(resolveAxes(4, 1, 1), [1, 0]);
	assert.equal(resolveAxes(1, 0, 1), null);
	assert.throws(() => sampleSlice(new Matrix([[0, 0]]), 0, 0, [], []), RangeError);
	assert.throws(() => sampleSlice(new Matrix([[0, 0]]), 0, 2, [], []), RangeError);
});

test("matrix clicks alternate axis assignment and selected cells swap axes", () => {
	let selection = { x: 0, y: 1, next: "horizontal" };
	selection = selectAxis(4, selection, 2);
	assert.deepEqual(selection, { x: 2, y: 1, next: "vertical" });
	selection = selectAxis(4, selection, 3);
	assert.deepEqual(selection, { x: 2, y: 3, next: "horizontal" });
	selection = selectAxis(4, selection, 3);
	assert.deepEqual(selection, { x: 3, y: 2, next: "horizontal" });
	selection = selectAxis(4, selection, 3);
	assert.deepEqual(selection, { x: 2, y: 3, next: "horizontal" });
	selection = selectAxis(2, selection, 1);
	assert.deepEqual(selection, { x: 1, y: 0, next: "horizontal" });
	assert.throws(() => selectAxis(1, selection, 0), RangeError);
	assert.throws(() => selectAxis(4, selection, 4), RangeError);
});

test("samples all matching ellipsoids and metaballs, including overlapping colors", () => {
	const matrix = new Matrix([
		[0, 0],
		[4, 0],
	]);
	const ellipsoid = {
		name: "ellipsoid",
		color: "red",
		position: matrix.clone(),
		scale: new Matrix([
			[1, 1],
			[1, 1],
		]),
	};
	const second = { ...ellipsoid, name: "second ellipsoid", color: "green" };
	const metaball = makeSpell(
		"metaball",
		[
			[0, 0],
			[4, 0],
		],
		"blue",
	);
	const samples = sampleSlice(matrix, 0, 1, [metaball], [ellipsoid, second]);
	assert.deepEqual(samples[84].matches, [ellipsoid, second, metaball]);
	assert.deepEqual(samples[86].matches, [ellipsoid, second]);
	assert.deepEqual(samples[87].matches, []);
	assert.equal(
		blendColors(samples[84].matches.map((spell) => spell.color)),
		"color-mix(in srgb, color-mix(in srgb, red 50%, green) 66.66666666666666%, blue)",
	);
	assert.deepEqual(matrix.to2DArray(), [
		[0, 0],
		[4, 0],
	]);
});

test("overlapping colors get equal weights", () => {
	assert.equal(blendColors([]), "var(--code-bg)");
	assert.equal(blendColors(["red"]), "red");
	assert.equal(blendColors(["red", "blue"]), "color-mix(in srgb, red 50%, blue)");
	assert.equal(
		blendColors(["red", "blue", "green"]),
		"color-mix(in srgb, color-mix(in srgb, red 50%, blue) 66.66666666666666%, green)",
	);
});

test("invalid metaball definitions remain explicit errors", () => {
	const invalid = makeSpell("invalid", [[0, 0]], "red");
	invalid.centers[0].positive_radius.set(0, 0, 0);
	assert.throws(() => sampleSlice(new Matrix([[0, 0]]), 0, 1, [invalid], []), RangeError);
});
