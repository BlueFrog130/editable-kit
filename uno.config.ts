import { defineConfig, presetUno } from 'unocss';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	presets: [presetUno()],
	extractors: [extractorSvelte()]
});
