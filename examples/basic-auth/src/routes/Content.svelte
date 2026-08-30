<script lang="ts">
	import * as Editable from 'editable-kit';
	import type { EditableState } from 'editable-kit';
	import type { Data } from '$lib/types';
	import { createDefaultProject } from '$lib';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { Snippet } from 'svelte';

	let {
		data = $bindable(),
		editing,
		toolbar,
		onsave
	}: {
		data: Data;
		editing: boolean;
		toolbar?: Snippet<[EditableState | undefined, () => Promise<void>]>;
		onsave?: (data: Data) => Promise<void>;
	} = $props();

	function addProject() {
		data.projects.push(createDefaultProject());
	}

	function removeProject(index: number) {
		data.projects = data.projects.filter((_, i) => i !== index);
	}
</script>

<Editable.Root bind:data {editing} {onsave}>
	{#snippet children({ state, save })}
		{#if toolbar && editing}
			{@render toolbar(state, save)}
		{/if}
		<div class="mx-auto max-w-4xl px-6 py-12">
			<!-- Hero Section -->
			<section class="flex flex-col items-center gap-6 text-center">
				<div class="size-40 overflow-hidden rounded-full">
					<Editable.Image bind:value={data.avatar} />
				</div>
				<div class="space-y-2">
					<h1 class="text-4xl font-bold tracking-tight">
						<Editable.Text bind:value={data.name} />
					</h1>
					<p class="text-lg text-muted-foreground">
						<Editable.Text bind:value={data.tagline} />
					</p>
				</div>
				<div class="prose max-w-2xl text-muted-foreground">
					<Editable.Multiline bind:value={data.bio} />
				</div>
			</section>

			<Separator class="my-12" />

			<!-- About Section -->
			<section class="space-y-4">
				<h2 class="text-2xl font-semibold tracking-tight">About Me</h2>
				<div class="prose max-w-none">
					<Editable.Rich bind:value={data.about} />
				</div>
			</section>

			<Separator class="my-12" />

			<!-- Featured Work -->
			<section class="space-y-6">
				<h2 class="text-2xl font-semibold tracking-tight">Featured Work</h2>
				<div class="grid gap-6 md:grid-cols-3">
					<!-- Keyed by item identity so removing a card cannot leave an editor
								 bound to the wrong project. -->
					{#each data.projects as project, i (project)}
						<Card.Root class="group/card relative pt-0">
							{#if editing}
								<button
									class="absolute -top-2 -right-2 z-10 flex size-7 items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white shadow-md transition-transform hover:scale-110"
									onclick={() => removeProject(i)}
								>
									&times;
								</button>
							{/if}
							<div class="aspect-video overflow-hidden rounded-t-xl">
								<Editable.Image bind:value={project.image} />
							</div>
							<Card.Header>
								<Card.Title class="text-lg">
									<Editable.Text bind:value={project.title} />
								</Card.Title>
							</Card.Header>
							<Card.Content>
								<div class="prose prose-sm max-w-none">
									<Editable.Rich bind:value={project.desc} />
								</div>
							</Card.Content>
						</Card.Root>
					{/each}

					{#if editing}
						<button
							class="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 text-muted-foreground/50 transition-colors hover:border-muted-foreground/50 hover:text-muted-foreground/80"
							onclick={addProject}
						>
							<span class="text-3xl font-light">+</span>
							<span class="text-sm font-medium">Add Project</span>
						</button>
					{/if}
				</div>
			</section>

			<Separator class="my-12" />

			<!-- Footer -->
			<footer class="pb-8 text-center">
				<div class="mx-auto prose max-w-2xl">
					<Editable.Rich bind:value={data.footer} />
				</div>
			</footer>
		</div>
	{/snippet}
</Editable.Root>
