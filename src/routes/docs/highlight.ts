import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

let highlighter: Awaited<ReturnType<typeof createHighlighterCore>> | undefined;

async function getHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighterCore({
			themes: [import('@shikijs/themes/github-light')],
			langs: [
				import('@shikijs/langs/svelte'),
				import('@shikijs/langs/typescript'),
				import('@shikijs/langs/bash')
			],
			engine: createJavaScriptRegexEngine()
		});
	}
	return highlighter;
}

export async function highlight(code: string, lang = 'svelte'): Promise<string> {
	const h = await getHighlighter();
	return h.codeToHtml(code, {
		lang,
		theme: 'github-light'
	});
}
