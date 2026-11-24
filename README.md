# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

## Spell detection

Spell definitions live in `src/results/ellipsoidSpells.ts` and `src/results/metaballSpells.ts`. The Check Spell button returns the first matching ellipsoid; only when none matches does it show all matching metaball spells.

Each metaball center specifies position and scale matrices matching the state dimensions. Every scale entry must be positive and finite. For each center, the squared normalized distance is the sum of `((value - position) / scale)²` over every matrix element. Its contribution is `max(0, 1 - distance²)²`; contributions are summed and compared against the spell's positive threshold.

Run the detection tests with `node --test tests/classification.test.mjs` (Node.js 24 or later).

## Metaball slice visualizer

Select two distinct matrix entries to view a two-axis slice centered on the current state; all other entries remain fixed. The plot samples a square from −3 to +3 on each axis at 0.5-unit intervals. Each cell shows the spell or equally blended spell colors at its sampled coordinate. Metaball spells must define a valid CSS color; ellipsoid spells are not shown.

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
