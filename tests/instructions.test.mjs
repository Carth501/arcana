import assert from "node:assert/strict";
import test from "node:test";
import {
	adjustments,
	canInvert,
	replayInstructions,
	transformations,
} from "../src/instructions.ts";

const values = (sequence) => {
	const result = replayInstructions(sequence);
	assert.equal(result.error, null);
	return result.matrix.to2DArray();
};

test("replay starts from zero and applies each adjustment independently", () => {
	assert.deepEqual(values(""), [
		[0, 0],
		[0, 0],
	]);
	assert.deepEqual(values("a"), [
		[1, 0],
		[0, 1],
	]);
	assert.deepEqual(values("s"), [
		[3, 1],
		[1, 0],
	]);
	assert.deepEqual(values("d"), [
		[-1, -1],
		[-1, -1],
	]);
	assert.deepEqual(values("f"), [
		[0, 1],
		[-1, 0],
	]);
	assert.deepEqual(
		adjustments.map((item) => item.code),
		["a", "s", "d", "f"],
	);
});

test("every transformation replays on the preceding matrix", () => {
	assert.deepEqual(values("sq"), [
		[5, 3],
		[3, 2],
	]);
	assert.deepEqual(values("sw"), [
		[6, 2],
		[2, 0],
	]);
	assert.deepEqual(values("se"), [
		[1, -1],
		[1, 0],
	]);
	assert.deepEqual(values("sr"), [
		[1.5, 1.2],
		[0.5, 0],
	]);
	assert.deepEqual(values("ft"), [
		[0, -1],
		[1, 0],
	]);
	assert.deepEqual(values("fy"), [
		[-1, 0],
		[0, 1],
	]);
	assert.deepEqual(values("fu"), [
		[-0, -1],
		[1, 0],
	]);
	assert.deepEqual(values("aqw"), [
		[6, 4],
		[4, 6],
	]);
	assert.deepEqual(values("awq"), [
		[4, 2],
		[2, 4],
	]);
	const codes = [
		...Object.values(transformations).map((item) => item.code),
		...adjustments.map((item) => item.code),
	];
	assert.equal(new Set(codes).size, codes.length);
});

test("unknown and case-mismatched characters preserve the valid prefix", () => {
	for (const text of ["a?sw", "aQsw", "a sw"]) {
		const result = replayInstructions(text);
		assert.deepEqual(result.matrix.to2DArray(), [
			[1, 0],
			[0, 1],
		]);
		assert.equal(result.error.position, 2);
		assert.equal(result.error.character, text[1]);
		assert.equal(result.error.message, "Unknown instruction");
	}
	assert.deepEqual(values("asw"), [
		[8, 2],
		[2, 2],
	]);
});

test("invalid inverse reports its position and can be fixed by editing", () => {
	const result = replayInstructions("quw");
	assert.deepEqual(result.matrix.to2DArray(), [
		[2, 2],
		[2, 2],
	]);
	assert.deepEqual(result.error, {
		character: "u",
		position: 2,
		message: "Matrix cannot be inverted",
	});
	assert.equal(canInvert(result.matrix), false);
	assert.equal(canInvert(replayInstructions("a").matrix), true);
	assert.deepEqual(values("au"), [
		[1, 0],
		[0, 1],
	]);
});

test("non-finite results stop replay at the last finite prefix", () => {
	const result = replayInstructions("a" + "w".repeat(1100));
	assert.equal(result.error.message, "Operation produces a non-finite result");
	assert.equal(result.error.character, "w");
	assert.ok(result.error.position > 1);
	assert.ok(result.matrix.to2DArray().flat().every(Number.isFinite));
});
