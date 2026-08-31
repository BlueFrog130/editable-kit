import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [devtoolsJson(), tailwindcss(), sveltekit()],
	server: {
		fs: {
			// `@editable-kit/core` resolves to `packages/core/src` — real TS source, outside
			// this project. SvelteKit narrows Vite's default allow list to the project dir, so
			// without this the browser gets a 403 for every core module. Widening it back to
			// the workspace root is what makes editing core hot-reload here.
			allow: [searchForWorkspaceRoot(process.cwd())]
		}
	},
	build: {
		minify: false,
		modulePreload: false,
		rollupOptions: {
			output: {
				// manualChunks: function (id) {
				// 	if (id.includes('@tiptap')) {
				// 		return 'tiptap';
				// 	}
				// }
			}
		}
	}
});
