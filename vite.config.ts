import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
	plugins: [devtoolsJson(), tailwindcss(), sveltekit()],
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
