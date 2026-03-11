import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '200.html'
		}),
		alias: {
			'@routes': 'src/routes',
			'@routes/*': 'src/routes/*'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
