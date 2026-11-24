# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Spell detection

Spell definitions live in `src/results/ellipsoidSpells.ts` and `src/results/metaballSpells.ts`. Detection updates automatically when the matrix changes. It returns the first matching ellipsoid; only when none matches does it show all matching metaball spells.

Each metaball center specifies position, `positive_radius`, and `negative_radius` matrices matching the state dimensions. Both radius matrices must contain positive, finite values. For each axis, use the negative radius when the value is below the center and the positive radius otherwise. The squared normalized distance is the sum of `((value - position) / radius)²` over every matrix element. Each center contributes `max(0, 1 - distance²)²`; contributions are summed and compared against the spell's positive threshold. Equal positive and negative radii retain the previous symmetric behavior.

Run the detection tests with `node --test tests/classification.test.mjs` (Node.js 24 or later).

## Transformation string

The editable string is replayed from the zero matrix, from left to right. Transformation buttons append their displayed case-sensitive letter; deleting or editing letters recalculates the matrix. Reset clears the string.

| Character          | Transformation                                         |
| ------------------ | ------------------------------------------------------ |
| `q`                | Add 2 to every entry                                   |
| `w`                | Multiply every entry by 2                              |
| `e`                | Subtract 2 from the first element of each column       |
| `r`                | Multiply the first column by 0.5 and the second by 1.2 |
| `t`                | Transpose                                              |
| `y`                | Swap rows                                              |
| `u`                | Invert                                                 |
| `a`, `s`, `d`, `f` | Add adjustment matrix 1, 2, 3, or 4 respectively       |

If a character is unknown or an operation cannot be performed, the string stays editable and an error identifies the character and position. The displayed matrix and detected spells use only the valid prefix; transformation buttons remain disabled until the error is fixed or Reset is pressed. An inverse is unavailable for a singular or near-singular matrix.

Run the replay tests with `node --test tests/instructions.test.mjs`. Modifier characters are a possible future feature to investigate; they are not currently supported.

## Spell slice visualizer

Click matrix entries to choose the slice axes: horizontal is red and vertical is blue. New selections alternate between horizontal and vertical; clicking either selected entry swaps the axes. All other entries remain fixed. The plot samples a square from −3 to +3 on each axis at 0.5-unit intervals. Each cell shows all matching ellipsoid and metaball spells, blending their colors equally where they overlap. Both types of spell must define a valid CSS color. Unlike automatic detection, the visualizer shows every matching region without applying ellipsoid priority.

The white ring marks the current position. The black cross marks the selected axes' projected origin when visible; this is not necessarily the full matrix origin. This is a sampled approximation, so small regions between samples may be missed.

Run the slice tests with `node --test tests/sliceSampling.test.mjs`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
	"$schema": "./node_modules/oxlint/configuration_schema.json",
	"plugins": ["react", "typescript", "oxc"],
	"options": {
		"typeAware": true
	},
	"rules": {
		"react/rules-of-hooks": "error",
		"react/only-export-components": ["warn", { "allowConstantExport": true }]
	}
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
