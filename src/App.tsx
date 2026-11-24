import { determinant, EigenvalueDecomposition } from "ml-matrix";
import { useMemo, useState } from "react";
import "./App.css";
import { detectSpells } from "./Classification";
import { adjustments, canInvert, replayInstructions, transformations } from "./instructions";
import { ellipsoidSpells } from "./results/ellipsoidSpells";
import { metaballSpells } from "./results/metaballSpells";
import { resolveAxes, selectAxis, type AxisSelection } from "./sliceSampling";
import { SliceVisualizer } from "./SliceVisualizer";

function App() {
	const [sequence, setSequence] = useState("");
	const [adjustmentIndex, setAdjustmentIndex] = useState(0);
	const { matrix: arcaneState, error } = useMemo(() => replayInstructions(sequence), [sequence]);
	const detectedSpells = useMemo(
		() => detectSpells(arcaneState, ellipsoidSpells, metaballSpells),
		[arcaneState],
	);
	const adjustment = adjustments[adjustmentIndex];
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

	const appendInstruction = (code: string) => setSequence((current) => current + code);

	return (
		<>
			<p>
				Click a matrix entry to select an axis. New selections alternate between horizontal
				(red) and vertical (blue); click a selected entry to swap axes.
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
														arcaneState.rows * arcaneState.columns,
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
			<p>Detected Spell: {detectedSpells.length ? detectedSpells.join(", ") : "None"}</p>

			<label htmlFor="instructions">Transformation string</label>
			<input
				id="instructions"
				value={sequence}
				onChange={(event) => setSequence(event.target.value)}
				aria-invalid={error !== null}
				aria-describedby={error ? "instruction-error" : undefined}
				spellCheck={false}
				autoComplete="off"
			/>
			{error && (
				<p id="instruction-error" role="alert">
					{error.message} at position {error.position}: {JSON.stringify(error.character)}.
					The matrix shows the valid prefix.
				</p>
			)}
			<button onClick={() => setSequence("")}>Reset</button>
			<div className="transformation-controls">
				<div className="transformation-grid">
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.add.code)}
					>
						{transformations.add.label} ({transformations.add.code})
					</button>
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.multiply.code)}
					>
						{transformations.multiply.label} ({transformations.multiply.code})
					</button>
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.subtract.code)}
					>
						{transformations.subtract.label} ({transformations.subtract.code})
					</button>
					<button disabled={!!error} onClick={() => appendInstruction(adjustment.code)}>
						Add Adjustment Matrix ({adjustment.code})
					</button>
					<select
						aria-label="Adjustment matrix"
						value={adjustmentIndex}
						onChange={(e) => {
							const index = parseInt(e.target.value, 10);
							if (!Number.isInteger(index) || !adjustments[index]) {
								throw new RangeError("Invalid adjustment matrix selection");
							}
							setAdjustmentIndex(index);
						}}
					>
						{adjustments.map((item, index) => (
							<option key={index} value={index}>
								{item.label} ({item.code})
							</option>
						))}
					</select>
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.scaleRows.code)}
					>
						{transformations.scaleRows.label} ({transformations.scaleRows.code})
					</button>
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.transpose.code)}
					>
						{transformations.transpose.label} ({transformations.transpose.code})
					</button>
					<button
						disabled={!!error}
						onClick={() => appendInstruction(transformations.swapRows.code)}
					>
						{transformations.swapRows.label} ({transformations.swapRows.code})
					</button>
					<button
						disabled={!!error || !canInvert(arcaneState)}
						onClick={() => appendInstruction(transformations.inverse.code)}
					>
						{transformations.inverse.label} ({transformations.inverse.code})
					</button>
				</div>
				<table className="adjustment-preview">
					<caption>Selected adjustment matrix</caption>
					<tbody>
						{adjustment.matrix.to2DArray().map((row, i) => (
							<tr key={i}>
								{row.map((value, j) => (
									<td key={j}>{value.toFixed(2)}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
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
