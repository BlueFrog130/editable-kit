import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import TurndownService from 'turndown';

const BUILD_DIR = 'build';
const BASE_URL = 'https://bluefrog130.github.io/editable-kit';

/**
 * Navigation structure — mirrors src/routes/docs/frameworks.ts. `slug` is the path
 * under /docs; a page's built file is that slug plus `.html`.
 */
const nav = [
	{
		category: 'Overview',
		items: [{ label: 'Introduction', slug: '' }]
	},
	{
		category: 'Core (framework-agnostic)',
		items: [
			{ label: 'Overview', slug: 'core' },
			{ label: 'Documents', slug: 'core/documents' },
			{ label: 'Field Editor', slug: 'core/field-editor' },
			{ label: 'Extensions', slug: 'core/extensions' }
		]
	},
	{
		category: 'Svelte',
		items: [
			{ label: 'Getting Started', slug: 'svelte/getting-started' },
			{ label: 'Editors', slug: 'svelte/editors' },
			{ label: 'Toolbar', slug: 'svelte/toolbar' },
			{ label: 'Extensions', slug: 'svelte/extensions' },
			{ label: 'Saving', slug: 'svelte/saving' },
			{ label: 'Arrays & Lists', slug: 'svelte/arrays' },
			{ label: 'Standalone Fields', slug: 'svelte/low-level' },
			{ label: 'Theming', slug: 'svelte/theming' },
			{ label: 'Patterns', slug: 'svelte/patterns' },
			{ label: 'Renderer', slug: 'svelte/renderer' },
			{ label: 'API Reference', slug: 'svelte/api' }
		]
	}
].map((group) => ({
	...group,
	items: group.items.map((item) => ({
		...item,
		file: item.slug ? `docs/${item.slug}.html` : 'docs.html'
	}))
}));

/**
 * Extract the <main> content from a full HTML page
 */
function extractMain(html) {
	const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
	if (!mainMatch) return '';
	return mainMatch[1];
}

/**
 * Extract the first <h1> text and first <p> after it for the summary description
 */
function extractDescription(html) {
	const mainHtml = extractMain(html);

	// Get first paragraph text after the h1 header section
	// The description is typically in a <p> with class containing "text-muted-foreground" right after h1
	const descMatch = mainHtml.match(
		/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*class="[^"]*text-(?:lg|muted)[^"]*"[^>]*>([\s\S]*?)<\/p>/
	);
	if (descMatch) {
		return stripTags(descMatch[1]).trim();
	}

	// Fallback: first <p> in main
	const pMatch = mainHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
	return pMatch ? stripTags(pMatch[1]).trim() : '';
}

/**
 * Strip HTML tags from a string
 */
function stripTags(html) {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&mdash;/g, '—')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&middot;/g, '·')
		.replace(/&larr;/g, '←')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Configure turndown for clean markdown output
 */
function createTurndown() {
	const td = new TurndownService({
		headingStyle: 'atx',
		codeBlockStyle: 'fenced',
		bulletListMarker: '-'
	});

	// Remove nav, aside, footer, buttons (copy buttons, nav toggles)
	td.remove(['nav', 'aside', 'footer', 'style', 'script', 'svg']);

	// Remove copy buttons and UI chrome
	td.addRule('removeCopyButtons', {
		filter(node) {
			if (node.nodeName === 'BUTTON') return true;
			// Remove separator divs
			if (node.nodeName === 'DIV' && node.getAttribute('data-slot') === 'separator') return true;
			// Remove tab triggers (pnpm/npm/yarn/bun tabs) — keep only content
			if (node.getAttribute('data-tabs-trigger') !== null) return true;
			// Remove inactive tab content
			if (
				node.getAttribute('data-tabs-content') !== null &&
				node.getAttribute('data-state') === 'inactive'
			)
				return true;
			// Remove tab list containers
			if (node.getAttribute('data-tabs-list') !== null) return true;
			return false;
		},
		replacement() {
			return '';
		}
	});

	// Handle code blocks
	td.addRule('codeBlocks', {
		filter(node) {
			return node.nodeName === 'PRE' && node.querySelector('code');
		},
		replacement(_content, node) {
			const code = node.querySelector('code');
			const text = code.textContent || '';
			return '\n\n```\n' + text.trim() + '\n```\n\n';
		}
	});

	return td;
}

/**
 * Convert HTML page content (main only) to clean markdown
 */
function htmlToMarkdown(html) {
	const mainHtml = extractMain(html);
	if (!mainHtml) return '';

	const td = createTurndown();
	let md = td.turndown(mainHtml);

	// Clean up excessive whitespace
	md = md
		.replace(/\n{3,}/g, '\n\n')
		.replace(/^\s+/, '')
		.replace(/\s+$/, '');

	return md;
}

/**
 * Generate llms.txt (summary with links)
 */
function generateLlmsTxt() {
	const lines = [
		'# editable-kit',
		'',
		'> Inline editing for the web. Plain text, rich text via TipTap, and images — without compromising performance, safety, or prerendering. `@editable-kit/core` is framework-agnostic; `@editable-kit/svelte` is the Svelte 5 adapter.',
		'',
		`- [Full documentation](${BASE_URL}/llms-full.txt): The complete editable-kit documentation including all examples`,
		''
	];

	for (const group of nav) {
		lines.push(`## ${group.category}`, '');
		for (const item of group.items) {
			const filePath = join(BUILD_DIR, item.file);
			if (!existsSync(filePath)) {
				console.warn(`  Warning: ${filePath} not found, skipping`);
				continue;
			}
			const html = readFileSync(filePath, 'utf-8');
			const description = extractDescription(html);
			const url = item.slug ? `${BASE_URL}/docs/${item.slug}` : `${BASE_URL}/docs`;
			lines.push(`- [${item.label}](${url}): ${description}`);
		}
		lines.push('');
	}

	lines.push(
		'## Notes',
		'',
		'- This content is automatically generated from the documentation pages',
		'- The Svelte adapter requires Svelte 5 (runes-based reactivity); core needs no framework',
		'- Rich text editing is powered by TipTap (ProseMirror)',
		''
	);

	return lines.join('\n');
}

/**
 * Generate llms-full.txt (full content)
 */
function generateLlmsFullTxt() {
	const lines = [
		'# editable-kit — Full Documentation',
		'',
		'> Inline editing for the web. Plain text, rich text via TipTap, and images — without compromising performance, safety, or prerendering. `@editable-kit/core` is framework-agnostic; `@editable-kit/svelte` is the Svelte 5 adapter.',
		''
	];

	for (const group of nav) {
		for (const item of group.items) {
			const filePath = join(BUILD_DIR, item.file);
			if (!existsSync(filePath)) {
				console.warn(`  Warning: ${filePath} not found, skipping`);
				continue;
			}
			const html = readFileSync(filePath, 'utf-8');
			const md = htmlToMarkdown(html);
			if (md) {
				lines.push(`---`, '', `# ${item.label}`, '', md, '');
			}
		}
	}

	return lines.join('\n');
}

// Run
console.log('Generating llms.txt and llms-full.txt...');

const llmsTxt = generateLlmsTxt();
writeFileSync(join(BUILD_DIR, 'llms.txt'), llmsTxt, 'utf-8');
console.log(`  llms.txt: ${llmsTxt.length} bytes`);

const llmsFullTxt = generateLlmsFullTxt();
writeFileSync(join(BUILD_DIR, 'llms-full.txt'), llmsFullTxt, 'utf-8');
console.log(`  llms-full.txt: ${llmsFullTxt.length} bytes`);

console.log('Done!');
