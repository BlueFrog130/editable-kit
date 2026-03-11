import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.BASE_PATH || '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base
		},
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
