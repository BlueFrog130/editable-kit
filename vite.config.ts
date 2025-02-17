import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import UnoCSS from 'unocss/vite';

export default defineConfig({
	plugins: [UnoCSS(), sveltekit()],
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
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
