import { determinant, inverse, Matrix } from "ml-matrix";

interface Instruction {
	code: string;
	label: string;
	apply: (matrix: Matrix) => Matrix;
}

const transformations = {
	add: {
		code: "q",
		label: "Add 2",
		apply: (matrix: Matrix) => matrix.clone().add(2),
	},
	multiply: {
		code: "w",
		label: "Multiply by 2",
		apply: (matrix: Matrix) => matrix.clone().mul(2),
	},
	subtract: {
		code: "e",
		label: "Subtract 2 from first element of each column",
		apply: (matrix: Matrix) => matrix.clone().addColumnVector([-2, 0]),
	},
	scaleRows: {
		code: "r",
		label: "Multiply first column by 0.5 and second column by 1.2",
		apply: (matrix: Matrix) => matrix.clone().mulRowVector([0.5, 1.2]),
	},
	transpose: {
		code: "t",
		label: "Transpose",
		apply: (matrix: Matrix) => matrix.transpose(),
	},
	swapRows: {
		code: "y",
		label: "Swap Rows",
		apply: (matrix: Matrix) => matrix.clone().swapRows(0, 1),
	},
	inverse: {
		code: "u",
		label: "Inverse",
		apply: (matrix: Matrix) => inverse(matrix),
	},
} satisfies Record<string, Instruction>;

const adjustments = [
	{
		code: "a",
		label: "Adjustment Matrix 1",
		matrix: new Matrix([
			[1, 0],
			[3, 1],
		]),
	},
	{
		code: "s",
		label: "Adjustment Matrix 2",
		matrix: new Matrix([
			[3, 1],
			[1, 0],
		]),
	},
	{
		code: "d",
		label: "Adjustment Matrix 3",
		matrix: new Matrix([
			[-1, 1],
			[-1, -4],
		]),
	},
	{
		code: "f",
		label: "Adjustment Matrix 4",
		matrix: new Matrix([
			[0, 1],
			[-1, 0],
		]),
	},
	{
		code: "9",
		label: "Adjustment Matrix 5",
		matrix: new Matrix([
			[-2, 3],
			[0, -1],
		]),
	},
	{
		code: "H",
		label: "Adjustment Matrix 6",
		matrix: new Matrix([
			[1, -3],
			[-3, 1],
		]),
	},
];

interface ReplayError {
	character: string;
	position: number;
	message: string;
}

interface ReplayResult {
	matrix: Matrix;
	error: ReplayError | null;
}

function canInvert(matrix: Matrix): boolean {
	const det = determinant(matrix);
	return Number.isFinite(det) && Math.abs(det) >= 1e-10;
}

function replayInstructions(sequence: string): ReplayResult {
	let matrix = new Matrix(2, 2);
	const characters = Array.from(sequence);
	for (let index = 0; index < characters.length; index++) {
		const character = characters[index];
		const instruction = Object.values(transformations).find(
			(item) => item.code === character,
		);
		const adjustment = adjustments.find((item) => item.code === character);
		const error = (message: string): ReplayResult => ({
			matrix,
			error: { character, position: index + 1, message },
		});

		if (!instruction && !adjustment) return error("Unknown instruction");
		if (character === transformations.inverse.code && !canInvert(matrix)) {
			return error("Matrix cannot be inverted");
		}

		let next: Matrix;
		try {
			if (instruction) {
				next = instruction.apply(matrix);
			} else if (adjustment) {
				next = matrix.clone().add(adjustment.matrix);
			} else {
				return error("Unknown instruction");
			}
		} catch (cause) {
			if (
				character === transformations.inverse.code &&
				cause instanceof Error &&
				cause.message === "LU matrix is singular"
			) {
				return error("Matrix cannot be inverted");
			}
			throw cause;
		}

		if (
			!next.to2DArray().every((row) => row.every(Number.isFinite)) ||
			!Number.isFinite(determinant(next))
		) {
			return error("Operation produces a non-finite result");
		}
		matrix = next;
	}
	return { matrix, error: null };
}

export { adjustments, canInvert, replayInstructions, transformations };
export type { ReplayError, ReplayResult };
