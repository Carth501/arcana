import {
	determinant,
	EigenvalueDecomposition,
	inverse,
	Matrix,
} from "ml-matrix";
import { useState } from "react";
import "./App.css";
import { detectSpells } from "./Classification";
import { ellipsoidSpells } from "./results/ellipsoidSpells";
import { metaballSpells } from "./results/metaballSpells";
import { resolveAxes, selectAxis, type AxisSelection } from "./sliceSampling";
import { SliceVisualizer } from "./SliceVisualizer";

function App() {
	const [arcaneState, setArcaneState] = useState(() => new Matrix(2, 2));
	const [previousState, setPreviousState] = useState<Matrix[]>([]);
	const [detectedSpells, setDetectedSpells] = useState<string[]>([]);
	const [axisSelection, setAxisSelection] = useState<AxisSelection>({
		x: 0,
		y: 1,
		next: "horizontal",
	});
	const axes = resolveAxes(
		arcaneState.rows * arcaneState.columns,
		axisSelection.x,
		axisSelection.y,
	);

	const reset = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(new Matrix(2, 2));
		setDetectedSpells([]);
	};

	const checkSpell = () => {
		setDetectedSpells(
			detectSpells(arcaneState, ellipsoidSpells, metaballSpells),
		);
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
		setArcaneState(arcaneState.clone().addColumnVector([-2, 0]));
	};
	const transform4 = () => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().mulRowVector([0.5, 1.2]));
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
	const adjustmentMatricies = [
		new Matrix([
			[1, 0],
			[0, 1],
		]),
		new Matrix([
			[3, 1],
			[1, 0],
		]),
		new Matrix([
			[-1, -1],
			[-1, -1],
		]),
		new Matrix([
			[0, 1],
			[-1, 0],
		]),
	];
	const [adjustmentMatrix, setAdjustmentMatrix] = useState(
		adjustmentMatricies[0],
	);
	const transform8 = (matrixToAdd: Matrix) => {
		setPreviousState((prev) => [...prev, arcaneState]);
		setArcaneState(arcaneState.clone().add(matrixToAdd));
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
			<p>
				Click a matrix entry to select an axis. New selections alternate
				between horizontal (red) and vertical (blue); click a selected
				entry to swap axes.
				{axes && ` Next new selection: ${axisSelection.next}.`}
			</p>
			<table className="matrix-table">
				<tbody>
					{arcaneState.to2DArray().map((row, i) => (
						<tr key={i}>
							{row.map((value, j) => {
								const index = i * arcaneState.columns + j;
								const selectedAxis =
									index === axes?.[0]
										? "horizontal"
										: index === axes?.[1]
											? "vertical"
											: null;
								return (
									<td key={j}>
										<button
											type="button"
											className={`matrix-axis${selectedAxis ? ` matrix-axis--${selectedAxis}` : ""}`}
											aria-label={`Row ${i + 1}, column ${j + 1}: ${value.toFixed(2)}${selectedAxis ? `, ${selectedAxis} axis selected; click to swap axes` : `, click to select ${axisSelection.next} axis`}`}
											aria-pressed={selectedAxis !== null}
											disabled={!axes}
											onClick={() =>
												setAxisSelection((current) =>
													selectAxis(
														arcaneState.rows *
															arcaneState.columns,
														current,
														index,
													),
												)
											}
										>
											{value.toFixed(2)}
										</button>
									</td>
								);
							})}
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
			<p>
				Detected Spell:{" "}
				{detectedSpells.length ? detectedSpells.join(", ") : "None"}
			</p>

			<button onClick={reset}>Reset</button>
			<div className="transformation-controls">
				<div className="transformation-grid">
					<button onClick={transform1}>Add 2</button>
					<button onClick={transform2}>Multiply by 2</button>
					<button onClick={transform3}>
						Subtract 2 from first element of each column
					</button>
					<button onClick={() => transform8(adjustmentMatrix)}>
						Add Adjustment Matrix
					</button>
					<select
						aria-label="Adjustment matrix"
						onChange={(e) => {
							const index = parseInt(e.target.value, 10);
							if (!isNaN(index)) {
								setAdjustmentMatrix(adjustmentMatricies[index]);
							}
						}}
					>
						{adjustmentMatricies.map((matrix, index) => (
							<option key={index} value={index}>
								Adjustment Matrix {index + 1}
							</option>
						))}
					</select>
					<button onClick={transform4}>
						Multiply first row by 0.5 and second row by 1.2
					</button>
					<button onClick={transform5}>Transpose</button>
					<button onClick={transform6}>Swap Rows</button>
					<button
						disabled={!checkMatrixDeterminant()}
						onClick={transform7}
					>
						Inverse
					</button>
				</div>
				<table className="adjustment-preview">
					<caption>Selected adjustment matrix</caption>
					<tbody>
						{adjustmentMatrix.to2DArray().map((row, i) => (
							<tr key={i}>
								{row.map((value, j) => (
									<td key={j}>{value.toFixed(2)}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
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
			<SliceVisualizer
				matrix={arcaneState}
				spells={metaballSpells}
				ellipsoidSpells={ellipsoidSpells}
				axes={axes}
			/>
		</>
	);
}

export default App;
