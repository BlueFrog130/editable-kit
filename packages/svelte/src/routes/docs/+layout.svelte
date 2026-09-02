<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sheet from '../components/ui/sheet/index.js';
	import * as Select from '../components/ui/select/index.js';
	import { Button } from '../components/ui/button/index.js';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import { CORE_NAV, FRAMEWORKS, frameworkFromPath, type NavGroup } from './frameworks.js';
	import { FRAMEWORK_ICONS } from './framework-icons.js';

	let { children }: { children: Snippet } = $props();

	let mobileNavOpen = $state(false);

	const framework = $derived(frameworkFromPath(page.url.pathname));
	const frameworkNav = $derived(
		(FRAMEWORKS.find((f) => f.id === framework)?.nav ?? []) as NavGroup[]
	);

	function selectFramework(id: string) {
		const next = FRAMEWORKS.find((f) => f.id === id);
		const first = next?.nav[0]?.items[0];
		if (first) goto(first.href);
	}

	function isActive(href: string) {
		if (href === resolve('/docs')) return page.url.pathname === resolve('/docs');
		return page.url.pathname.startsWith(href);
	}
</script>

{#snippet navLink(label: string, href: string)}
	<a
		{href}
		onclick={() => (mobileNavOpen = false)}
		class="block rounded-md px-3 py-1.5 text-sm transition-colors {isActive(href)
			? 'bg-muted font-medium text-foreground'
			: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}"
	>
		{label}
	</a>
{/snippet}

{#snippet navGroups(groups: NavGroup[])}
	{#each groups as group (group.category)}
		<div>
			<p class="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
				{group.category}
			</p>
			<ul class="space-y-1">
				{#each group.items as item (item.href)}
					<li>{@render navLink(item.label, item.href)}</li>
				{/each}
			</ul>
		</div>
	{/each}
{/snippet}

{#snippet frameworkIcon(id: string)}
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d={FRAMEWORK_ICONS[id]} />
	</svg>
{/snippet}

{#snippet sidebar()}
	<div class="space-y-6">
		<Select.Root type="single" value={framework} onValueChange={selectFramework}>
			<Select.Trigger class="w-full" aria-label="Select framework">
				<!-- one child, so justify-between keeps the label beside its icon, not centred -->
				<span class="flex items-center gap-2">
					{@render frameworkIcon(framework)}
					{FRAMEWORKS.find((f) => f.id === framework)?.label}
				</span>
			</Select.Trigger>
			<Select.Content>
				{#each FRAMEWORKS as f (f.id)}
					<Select.Item value={f.id} label={f.label} disabled={f.nav.length === 0}>
						{@render frameworkIcon(f.id)}
						{f.label}
						{#if f.nav.length === 0}
							<span class="text-xs text-muted-foreground">coming soon</span>
						{/if}
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<ul class="space-y-1">
			<li>{@render navLink('Introduction', resolve('/docs'))}</li>
		</ul>

		{@render navGroups(CORE_NAV)}
		{@render navGroups(frameworkNav)}
	</div>
{/snippet}

<div class="flex min-h-screen flex-col">
	<nav
		class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70"
	>
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					class="md:hidden"
					onclick={() => (mobileNavOpen = true)}
				>
					<MenuIcon class="size-4" />
					<span class="sr-only">Open navigation</span>
				</Button>
				<a
					href={resolve('/')}
					class="flex items-center gap-1.5 text-xs tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-foreground"
				>
					<span class="text-base">&larr;</span> Demo
				</a>
			</div>
			<span class="text-xs tracking-[0.15em] text-muted-foreground uppercase">Documentation</span>
		</div>
	</nav>

	<div class="mx-auto flex w-full max-w-6xl flex-1 px-6">
		<!-- Sidebar -->
		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border pt-10 pr-6 pb-10 md:block"
		>
			{@render sidebar()}
		</aside>

		<!-- Mobile nav sheet -->
		<Sheet.Root bind:open={mobileNavOpen}>
			<Sheet.Content side="left" class="w-64 p-0">
				<Sheet.Header class="border-b border-border px-6 py-4">
					<Sheet.Title class="text-xs tracking-[0.15em] uppercase">Navigation</Sheet.Title>
				</Sheet.Header>
				<nav class="overflow-y-auto px-4 py-6">
					{@render sidebar()}
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Content -->
		<main class="min-w-0 flex-1 py-16 md:pl-10">
			<div class="max-w-3xl">
				{@render children()}
			</div>
		</main>
	</div>

	<footer class="border-t border-border">
		<div class="mx-auto max-w-6xl px-6 py-10">
			<div class="flex flex-col items-center gap-4 text-center">
				<p class="font-serif text-lg">editable-kit</p>
				<p class="text-xs text-muted-foreground">
					Built with
					<a
						href="https://svelte.dev"
						class="underline underline-offset-2 transition-colors hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer">Svelte 5</a
					>
					&middot; Powered by
					<a
						href="https://tiptap.dev"
						class="underline underline-offset-2 transition-colors hover:text-foreground"
						target="_blank"
						rel="noopener noreferrer">TipTap</a
					>
				</p>
			</div>
		</div>
	</footer>
</div>
