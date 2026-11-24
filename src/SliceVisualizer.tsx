import { useId } from "react";
import type { Matrix } from "ml-matrix";
import type { MetaballSpell, Spell } from "./Classification";
import { blendColors, isProjectedOriginVisible, sampleSlice } from "./sliceSampling";

interface SliceVisualizerProps {
	matrix: Matrix;
	spells: MetaballSpell[];
	ellipsoidSpells: Spell[];
	axes: [number, number] | null;
}

const PLOT_START = 50;
const PLOT_SIZE = 300;
const UNITS_TO_PIXELS = PLOT_SIZE / 6;

function SliceVisualizer({ matrix, spells, ellipsoidSpells, axes }: SliceVisualizerProps) {
	const clipId = useId();

	if (axes === null) {
		return (
			<section className="slice-visualizer">
				<h2>Spell slice</h2>
				<p>At least two matrix entries are needed to display a slice.</p>
			</section>
		);
	}

	const [xAxis, yAxis] = axes;
	const axisLabel = (index: number) =>
		`Row ${Math.floor(index / matrix.columns) + 1}, column ${(index % matrix.columns) + 1}`;
	const currentX = matrix.get(Math.floor(xAxis / matrix.columns), xAxis % matrix.columns);
	const currentY = matrix.get(Math.floor(yAxis / matrix.columns), yAxis % matrix.columns);
	const allSpells = [...ellipsoidSpells, ...spells];
	const invalidColors = allSpells.filter(
		(spell) => !CSS.supports("color", `color-mix(in srgb, ${spell.color}, black)`),
	);

	if (invalidColors.length) {
		return (
			<section className="slice-visualizer">
				<h2>Spell slice</h2>
				<p role="alert">
					Invalid or unsupported spell colors:{" "}
					{invalidColors.map((spell) => spell.name).join(", ")}.
				</p>
			</section>
		);
	}

	const samples = sampleSlice(matrix, xAxis, yAxis, spells, ellipsoidSpells);
	const ticks = Array.from({ length: 7 }, (_, index) => index - 3);
	const toX = (value: number) =>
		PLOT_START + PLOT_SIZE / 2 + (value - currentX) * UNITS_TO_PIXELS;
	const toY = (value: number) =>
		PLOT_START + PLOT_SIZE / 2 - (value - currentY) * UNITS_TO_PIXELS;
	const originVisible = isProjectedOriginVisible(currentX, currentY);

	return (
		<section className="slice-visualizer" aria-labelledby={`${clipId}-title`}>
			<h2 id={`${clipId}-title`}>Spell slice</h2>
			<p>
				Horizontal (red): {axisLabel(xAxis)}. Vertical (blue): {axisLabel(yAxis)}.
			</p>
			<p>
				Other matrix entries stay fixed. Each cell represents a sample; boundaries are
				approximate.
			</p>
			<svg
				className="slice-plot"
				viewBox="0 0 400 400"
				role="img"
				aria-label={`Spell slice: horizontal ${axisLabel(xAxis)}, vertical ${axisLabel(yAxis)}. White ring marks the current position; black cross marks the projected origin when visible.`}
			>
				<defs>
					<clipPath id={clipId}>
						<rect x={PLOT_START} y={PLOT_START} width={PLOT_SIZE} height={PLOT_SIZE} />
					</clipPath>
				</defs>
				<g clipPath={`url(#${clipId})`}>
					{samples.map((sample, index) => (
						<rect
							key={index}
							x={toX(sample.x) - 12.5}
							y={toY(sample.y) - 12.5}
							width="25"
							height="25"
							fill={blendColors(sample.matches.map((spell) => spell.color))}
							className="slice-cell"
						>
							<title>{`(${sample.x}, ${sample.y}): ${sample.matches.length ? sample.matches.map((spell) => spell.name).join(", ") : "No spell"}`}</title>
						</rect>
					))}
					{originVisible && (
						<g className="slice-origin" transform={`translate(${toX(0)} ${toY(0)})`}>
							<title>Projected origin (0, 0)</title>
							<path d="M -7 0 H 7 M 0 -7 V 7" />
						</g>
					)}
					<circle cx={toX(currentX)} cy={toY(currentY)} r="7" className="slice-current">
						<title>Current position</title>
					</circle>
				</g>
				<rect
					x={PLOT_START}
					y={PLOT_START}
					width={PLOT_SIZE}
					height={PLOT_SIZE}
					className="slice-frame"
				/>
				{ticks.map((tick) => (
					<g key={tick} className="slice-tick">
						<text x={toX(currentX + tick)} y="370" textAnchor="middle">
							{(currentX + tick).toFixed(1)}
						</text>
						<text x="44" y={toY(currentY + tick) + 4} textAnchor="end">
							{(currentY + tick).toFixed(1)}
						</text>
					</g>
				))}
			</svg>
			<p>
				White ring: current position. Black cross: projected origin
				{originVisible ? "" : " (outside this window)"}.
			</p>
			<ul className="slice-legend" aria-label="Spell colors">
				{allSpells.map((spell, index) => (
					<li key={index}>
						<span
							className="slice-swatch"
							style={{ backgroundColor: spell.color }}
							aria-hidden="true"
						/>
						{spell.name}
					</li>
				))}
			</ul>
		</section>
	);
}

export { SliceVisualizer };
