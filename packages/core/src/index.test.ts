import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * View mode must not pull TipTap. Every `@tiptap/*` runtime import has to sit behind a
 * dynamic `import()` (or be type-only), or the whole ~100 KB gzip editor stack lands in
 * the initial chunk — which is exactly what `EkImage` used to do here.
 *
 * `EkImage` is the deliberate exception: it is a top-level `Image.extend(...)`, so
 * bundlers can only drop it when nobody imports it. That is what core's
 * `"sideEffects": false` buys, and it is why this test allows the one file.
 */
const ALLOWED = ['editor/image-extension.ts'];

// ponytail: regex over source, no TS AST — the only false positive would be an import
// line inside a comment, and there are none.
const STATIC_IMPORT = /^\s*(?:import|export)\s+(?!type\b)(?:[^'";]*\sfrom\s*)?'([^']+)'/gm;

const slash = (p: string) => p.replaceAll('\\', '/');

function walk(file: string, seen = new Set<string>()): string[] {
	if (seen.has(file)) return [];
	seen.add(file);
	const hits: string[] = [];
	for (const [, spec] of readFileSync(file, 'utf8').matchAll(STATIC_IMPORT)) {
		if (spec.startsWith('@tiptap/')) hits.push(`${slash(file)} -> ${spec}`);
		else if (spec.startsWith('.')) {
			const next = resolve(dirname(file), spec.replace(/\.js$/, '.ts'));
			if (!ALLOWED.some((a) => slash(next).endsWith(a))) hits.push(...walk(next, seen));
		}
	}
	return hits;
}

describe('view-mode bundle', () => {
	it('reaches no @tiptap runtime module from the public entry', () => {
		expect(walk(resolve(import.meta.dirname, 'index.ts'))).toEqual([]);
	});
});
