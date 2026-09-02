import { resolve } from '$app/paths';

export type NavItem = { label: string; href: string };
export type NavGroup = { category: string; items: NavItem[] };

/** Framework-agnostic docs — the `@editable-kit/core` surface. */
export const CORE_NAV: NavGroup[] = [
	{
		category: 'Core',
		items: [
			{ label: 'Overview', href: resolve('/docs/core') },
			{ label: 'Documents', href: resolve('/docs/core/documents') },
			{ label: 'Field Editor', href: resolve('/docs/core/field-editor') },
			{ label: 'Extensions', href: resolve('/docs/core/extensions') }
		]
	}
];

/**
 * The framework selector's options. `nav` empty means the adapter does not exist yet —
 * the option is listed but disabled. Adding a framework is one entry here plus its
 * routes under `/docs/<id>`.
 */
export const FRAMEWORKS = [
	{
		id: 'svelte',
		label: 'Svelte',
		nav: [
			{
				category: 'Overview',
				items: [{ label: 'Getting Started', href: resolve('/docs/svelte/getting-started') }]
			},
			{
				category: 'Guide',
				items: [
					{ label: 'Editors', href: resolve('/docs/svelte/editors') },
					// No toolbar ships — you build one, so this is a guide, not a component.
					{ label: 'Toolbar', href: resolve('/docs/svelte/toolbar') },
					{ label: 'Extensions', href: resolve('/docs/svelte/extensions') },
					{ label: 'Saving', href: resolve('/docs/svelte/saving') },
					{ label: 'Arrays & Lists', href: resolve('/docs/svelte/arrays') },
					{ label: 'Standalone Fields', href: resolve('/docs/svelte/low-level') },
					{ label: 'Theming', href: resolve('/docs/svelte/theming') },
					{ label: 'Patterns', href: resolve('/docs/svelte/patterns') }
				]
			},
			{
				category: 'Components',
				items: [{ label: 'Renderer', href: resolve('/docs/svelte/renderer') }]
			},
			{
				category: 'Reference',
				items: [{ label: 'API Reference', href: resolve('/docs/svelte/api') }]
			}
		] satisfies NavGroup[]
	},
	{ id: 'react', label: 'React', nav: [] },
	{ id: 'vue', label: 'Vue', nav: [] }
] as const;

export type FrameworkId = (typeof FRAMEWORKS)[number]['id'];

export const DEFAULT_FRAMEWORK: FrameworkId = 'svelte';

/** Which framework a docs URL is under, defaulting to the one that exists. */
export function frameworkFromPath(pathname: string): FrameworkId {
	const match = FRAMEWORKS.find((f) => pathname.includes(`/docs/${f.id}`));
	return match?.id ?? DEFAULT_FRAMEWORK;
}
