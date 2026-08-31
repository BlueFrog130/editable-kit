<script lang="ts">
	import { pickFile, type EditableState } from '@editable-kit/svelte';
	import { enhance } from '$app/forms';
	import { upload } from '$lib';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let {
		oncancel,
		onsave,
		state: editState
	}: {
		oncancel: () => unknown;
		onsave: () => Promise<void>;
		state: EditableState | undefined;
	} = $props();

	const bold = $derived(editState?.command('bold', (e) => e.chain().focus().toggleBold().run()));
	const italic = $derived(
		editState?.command('italic', (e) => e.chain().focus().toggleItalic().run())
	);
	const underline = $derived(
		editState?.command('underline', (e) => e.chain().focus().toggleUnderline().run())
	);
	const strike = $derived(
		editState?.command('strike', (e) => e.chain().focus().toggleStrike().run())
	);

	let altValue = $state('');
	let editingAlt = $state(false);
	let editingSrc = $state(false);
	let srcValue = $state('');
</script>

{#if editState}
	<div
		class="fixed top-4 left-1/2 z-50 mx-auto mb-4 flex w-full max-w-xl -translate-x-1/2 flex-wrap items-center gap-1 rounded-md border border-border bg-background p-1 shadow-lg"
	>
		<Button
			variant="ghost"
			size="sm"
			class={[
				'px-2.5 text-xs font-bold',
				bold?.isActive &&
					'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
			]}
			disabled={!bold?.has}
			onclick={bold?.run}
		>
			B
		</Button>
		<Button
			variant="ghost"
			size="sm"
			class={[
				'px-2.5 text-xs font-medium italic',
				italic?.isActive &&
					'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
			]}
			disabled={!italic?.has}
			onclick={italic?.run}
		>
			I
		</Button>
		<Button
			variant="ghost"
			size="sm"
			class={[
				'px-2.5 text-xs font-medium underline',
				underline?.isActive &&
					'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
			]}
			disabled={!underline?.has}
			onclick={underline?.run}
		>
			U
		</Button>
		<Button
			variant="ghost"
			size="sm"
			class={[
				'px-2.5 text-xs font-medium line-through',
				strike?.isActive &&
					'bg-foreground text-background hover:bg-foreground/90 hover:text-background'
			]}
			disabled={!strike?.has}
			onclick={strike?.run}
		>
			S
		</Button>

		{#if editState.isActive('image')}
			<div class="mx-1 h-4 w-px bg-border"></div>

			{#if editingSrc}
				<form
					class="flex items-center gap-1"
					onsubmit={(e) => {
						e.preventDefault();
						if (srcValue.trim()) {
							editState.run((e) => e.chain().focus().setImage({ src: srcValue.trim() }).run());
						}
						editingSrc = false;
						srcValue = '';
					}}
				>
					<Input class="h-7 w-48 text-xs" placeholder="https://..." bind:value={srcValue} />
					<Button variant="ghost" size="sm" type="submit" class="h-7 px-2 text-xs">OK</Button>
					<Button
						variant="ghost"
						size="sm"
						class="h-7 px-1.5 text-xs text-muted-foreground"
						onclick={() => {
							editingSrc = false;
							srcValue = '';
						}}
					>
						&times;
					</Button>
				</form>
			{:else}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="ghost" size="sm" class="px-2.5 text-xs" {...props}>Replace</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start">
						<DropdownMenu.Item
							onclick={async () => {
								const file = await pickFile();
								if (!file) return;
								const src = await upload(file);
								editState.run((e) => e.chain().focus().setImage({ src }).run());
							}}
						>
							Upload file
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => (editingSrc = true)}>From URL</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}

			{#if editingAlt}
				<form
					class="flex items-center gap-1"
					onsubmit={(e) => {
						e.preventDefault();
						editState.run((e) =>
							e.chain().focus().updateAttributes('image', { alt: altValue }).run()
						);
						editingAlt = false;
					}}
				>
					<Input class="h-7 w-32 text-xs" placeholder="Alt text" bind:value={altValue} />
					<Button variant="ghost" size="sm" type="submit" class="h-7 px-2 text-xs">OK</Button>
					<Button
						variant="ghost"
						size="sm"
						class="h-7 px-1.5 text-xs text-muted-foreground"
						onclick={() => (editingAlt = false)}
					>
						&times;
					</Button>
				</form>
			{:else}
				<Button
					variant="ghost"
					size="sm"
					class="px-2.5 text-xs"
					onclick={() => {
						altValue = editState.editor?.getAttributes('image').alt ?? '';
						editingAlt = true;
					}}
				>
					Alt
				</Button>
			{/if}
		{/if}

		<div class="grow"></div>

		<form method="POST" action="/logout" use:enhance class="contents">
			<Button variant="ghost" size="sm" class="px-2.5 text-xs text-destructive" type="submit">
				Logout
			</Button>
		</form>
		<Button variant="ghost" size="sm" class="px-2.5 text-xs" onclick={oncancel}>Cancel</Button>
		<Button size="sm" class="px-2.5 text-xs" onclick={onsave}>Save</Button>
	</div>
{/if}
