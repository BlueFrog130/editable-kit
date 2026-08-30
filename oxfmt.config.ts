import { defineConfig } from 'oxfmt';

export default defineConfig({
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	sortPackageJson: false,
	// requires `svelte` at the root — oxfmt doesn't bundle svelte/compiler
	svelte: {},
	sortTailwindcss: {
		stylesheet: './packages/editable-kit/src/app.css'
	},
	ignorePatterns: ['pnpm-lock.yaml', '**/.svelte-kit/**', '**/dist/**', '**/build/**']
});
