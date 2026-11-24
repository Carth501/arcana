import assert from "node:assert/strict";
import test from "node:test";
import { Matrix } from "ml-matrix";
import { detectMetaballSpells, detectSpells } from "../src/Classification.ts";
import { ellipsoidSpells } from "../src/results/ellipsoidSpells.ts";
import { metaballSpells } from "../src/results/metaballSpells.ts";

const matrix = (values) => new Matrix(values);
const point = (x, y = 0) => matrix([[x, y]]);
const center = (x, y = 0, xRadius = 1, yRadius = 1) => ({
	position: point(x, y),
	positive_radius: point(xRadius, yRadius),
	negative_radius: point(xRadius, yRadius),
});

test("metaball falloff respects center, anisotropic radii, and boundary", () => {
	const spells = [
		{ name: "bubble", color: "red", centers: [center(0, 0, 2, 1)], threshold: 0.5625 },
	];
	assert.deepEqual(detectMetaballSpells(point(0), spells), ["bubble"]);
	assert.deepEqual(detectMetaballSpells(point(1), spells), ["bubble"]);
	assert.deepEqual(detectMetaballSpells(point(0, 0.51), spells), []);
	assert.deepEqual(detectMetaballSpells(point(2), spells), []);
	assert.deepEqual(detectMetaballSpells(point(3), spells), []);
});

test("metaball radii can differ on each side of each axis", () => {
	const asymmetric = {
		position: point(0),
		positive_radius: point(2, 1),
		negative_radius: point(1, 2),
	};
	const spells = [{ name: "asymmetric", color: "red", centers: [asymmetric], threshold: 0.5625 }];
	for (const value of [point(0), point(1), point(-0.5), point(0, 0.5), point(0, -1)]) {
		assert.deepEqual(detectMetaballSpells(value, spells), ["asymmetric"]);
	}
	for (const value of [point(1.01), point(-0.51), point(0, 0.51), point(0, -1.01)]) {
		assert.deepEqual(detectMetaballSpells(value, spells), []);
	}
});

test("overlapping centers combine and all matching spells are returned in order", () => {
	const spells = [
		{
			name: "bridge",
			color: "red",
			centers: [center(-1, 0, 2), center(1, 0, 2)],
			threshold: 1.1,
		},
		{ name: "second", color: "blue", centers: [center(0)], threshold: 1 },
		{ name: "no match", color: "green", centers: [center(4)], threshold: 0.5 },
	];
	assert.deepEqual(detectMetaballSpells(point(0), spells), ["bridge", "second"]);
});

test("ellipsoid results take priority; fallback returns all matches or none", () => {
	const ellipsoids = [
		{ name: "first", color: "red", position: point(0), scale: point(1, 1) },
		{ name: "second", color: "blue", position: point(0), scale: point(1, 1) },
	];
	const fallback = [{ name: "fallback", color: "red", centers: [center(0)], threshold: 0.5 }];
	assert.deepEqual(detectSpells(point(0), ellipsoids, fallback), ["first"]);
	assert.deepEqual(detectSpells(point(0), ellipsoids, [{ ...fallback[0], threshold: 0 }]), [
		"first",
	]);
	assert.deepEqual(detectSpells(point(0), [], fallback), ["fallback"]);
	assert.deepEqual(detectSpells(point(3), ellipsoids, fallback), []);
});

test("example definitions yield overlapping fallback matches at the origin", () => {
	assert.deepEqual(
		detectSpells(
			matrix([
				[0, 0],
				[0, 0],
			]),
			ellipsoidSpells,
			metaballSpells,
		),
		["Arcane Bridge", "Quiet Spark"],
	);
});

test("invalid metaball definitions and coordinates fail explicitly", () => {
	const valid = { name: "test", color: "red", centers: [center(0)], threshold: 0.5 };
	assert.throws(() => detectMetaballSpells(point(0), [{ ...valid, threshold: 0 }]), RangeError);
	assert.throws(
		() => detectMetaballSpells(point(0), [{ ...valid, threshold: Infinity }]),
		RangeError,
	);
	assert.throws(() => detectMetaballSpells(point(0), [{ ...valid, centers: [] }]), RangeError);
	assert.throws(
		() => detectMetaballSpells(point(0), [{ ...valid, centers: [center(0, 0, 0)] }]),
		RangeError,
	);
	const invalidNegative = center(0);
	invalidNegative.negative_radius.set(0, 0, 0);
	assert.throws(
		() => detectMetaballSpells(point(0.1), [{ ...valid, centers: [invalidNegative] }]),
		RangeError,
	);
	const invalidPositive = center(0);
	invalidPositive.positive_radius.set(0, 0, Infinity);
	assert.throws(
		() => detectMetaballSpells(point(-0.1), [{ ...valid, centers: [invalidPositive] }]),
		RangeError,
	);
	const wrongDimensions = center(0);
	wrongDimensions.negative_radius = matrix([[1], [1]]);
	assert.throws(
		() => detectMetaballSpells(point(0), [{ ...valid, centers: [wrongDimensions] }]),
		RangeError,
	);
	const wrongPositiveDimensions = center(0);
	wrongPositiveDimensions.positive_radius = matrix([[1], [1]]);
	assert.throws(
		() => detectMetaballSpells(point(0), [{ ...valid, centers: [wrongPositiveDimensions] }]),
		RangeError,
	);
	assert.throws(
		() => detectMetaballSpells(point(0), [{ ...valid, centers: [center(Infinity)] }]),
		RangeError,
	);
	assert.throws(() => detectMetaballSpells(point(NaN), [valid]), RangeError);
	assert.throws(() => detectMetaballSpells(matrix([[0], [0]]), [valid]), RangeError);
});
