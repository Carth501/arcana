import {
	determinant,
	EigenvalueDecomposition,
	inverse,
	Matrix,
} from "ml-matrix";
import { useState } from "react";
import "./App.css";
import { detectResult, type Spell } from "./Classification";

function App() {
	const [arcaneState, setArcaneState] = useState(() => new Matrix(3, 3));
	const [previousState, setPreviousState] = useState<Matrix[]>([]);
	const [detectedSpell, setDetectedSpell] = useState<string | null>(null);

	// Define some test spells
	const spells: Spell[] = [
		{
			name: "Fireball",
			position: new Matrix([
				[2, 2, 2],
				[2, 2, 2],
				[2, 2, 2],
			]),
			scale: new Matrix([
				[0.5, 0.5, 0.5],
				[0.5, 0.5, 0.5],
				[0.5, 0.5, 0.5],
			]),
		},
		{
			name: "Frostbolt",
			position: new Matrix([
				[-1, 0, 0],
				[0, -1, 0],
				[0, 0, -1],
			]),
			scale: new Matrix([
				[0.3, 0, 0],
				[0, 0.3, 0],
				[0, 0, 0.3],
			]),
		},
	];

	const reset = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(new Matrix(3, 3));
		setDetectedSpell(null);
	};

	const checkSpell = () => {
		const result = detectResult(arcaneState, spells);
		setDetectedSpell(result);
	};
	// add 2 to each element of the matrix
	const transform1 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().add(2));
	};
	const transform2 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().mul(2));
	};
	// subtract 2 from the first element of each column
	const transform3 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().addColumnVector([-2, 0, 0]));
	};
	const transform4 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().mulRowVector([0.5, 1.2, 1]));
	};
	const transform5 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().transpose());
	};
	const transform6 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().swapRows(0, 1));
	};
	const transform7 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(inverse(arcaneState));
	};

	const checkMatrixDeterminant = () => {
		const det = determinant(arcaneState);
		if (Math.abs(det) < 1e-10) {
			return false;
		}
		return true;
	};

	return (
		<>
			<table>
				<tbody>
					{arcaneState.to2DArray().map((row, i) => (
						<tr key={i}>
							{row.map((value, j) => (
								<td key={j}>{value.toFixed(2)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<p>Determinant: {determinant(arcaneState).toFixed(2)}</p>
			<p>Trace: {arcaneState.trace().toFixed(2)}</p>
			<p>Rank: ?</p>
			<p>Norm: {arcaneState.norm().toFixed(2)}</p>
			<p>
				Eigenvalues:{" "}
				{new EigenvalueDecomposition(arcaneState).realEigenvalues
					.map((val) => val.toFixed(2))
					.join(", ")}
			</p>
			<p>Detected Spell: {detectedSpell || "None"}</p>

			<button onClick={reset}>Reset</button>
			<button onClick={transform1}>Add 2</button>
			<button onClick={transform2}>Multiply by 2</button>
			<button onClick={transform3}>
				Subtract 2 from first element of each column
			</button>
			<button onClick={transform4}>
				Multiply first row by 0.5 and second row by 1.2
			</button>
			<button onClick={transform5}>Transpose</button>
			<button onClick={transform6}>Swap Rows</button>
			<button disabled={!checkMatrixDeterminant()} onClick={transform7}>
				Inverse
			</button>
			<button
				disabled={previousState.length === 0}
				onClick={() => {
					setArcaneState(previousState[previousState.length - 1]);
					setPreviousState((prev) => prev.slice(0, prev.length - 1));
				}}
			>
				Undo
			</button>
			<button onClick={checkSpell}>Check Spell</button>
		</>
	);
}

export default App;
