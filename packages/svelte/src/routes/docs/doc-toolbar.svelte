<script lang="ts">
	import type { EditableState } from '$lib/components/editable/editable-state.svelte.js';
	import { pickFile } from '$lib/index.js';
	import { uploadAsDataURL } from '../apply-fields.js';

	let { state: editState }: { state: EditableState } = $props();

	const bold = $derived(editState.command('bold', (e) => e.chain().focus().toggleBold().run()));
	const italic = $derived(
		editState.command('italic', (e) => e.chain().focus().toggleItalic().run())
	);
	const underline = $derived(
		editState.command('underline', (e) => e.chain().focus().toggleUnderline().run())
	);
	const strike = $derived(
		editState.command('strike', (e) => e.chain().focus().toggleStrike().run())
	);

	const imageActive = $derived(editState.isActive('image'));

	let altValue = $state('');
	let editingAlt = $state(false);
</script>

<div class="mb-4 flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
	<button
		class={[
			'rounded px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-30',
			bold.isActive ? 'bg-foreground text-background' : 'hover:bg-muted'
		]}
		disabled={!bold.has}
		onclick={bold.run}
	>
		B
	</button>
	<button
		class={[
			'rounded px-2.5 py-1 text-xs font-medium italic transition-colors disabled:opacity-30',
			italic.isActive ? 'bg-foreground text-background' : 'hover:bg-muted'
		]}
		disabled={!italic.has}
		onclick={italic.run}
	>
		I
	</button>
	<button
		class={[
			'rounded px-2.5 py-1 text-xs font-medium underline transition-colors disabled:opacity-30',
			underline.isActive ? 'bg-foreground text-background' : 'hover:bg-muted'
		]}
		disabled={!underline.has}
		onclick={underline.run}
	>
		U
	</button>
	<button
		class={[
			'rounded px-2.5 py-1 text-xs font-medium line-through transition-colors disabled:opacity-30',
			strike.isActive ? 'bg-foreground text-background' : 'hover:bg-muted'
		]}
		disabled={!strike.has}
		onclick={strike.run}
	>
		S
	</button>

	{#if imageActive}
		<div class="mx-1 h-4 w-px bg-border"></div>
		<button
			class="rounded px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
			onclick={async () => {
				const file = await pickFile();
				if (!file) return;
				const src = await uploadAsDataURL(file);
				editState.run((e) => e.chain().focus().setImage({ src }).run());
			}}
		>
			Replace
		</button>
		{#if editingAlt}
			<form
				class="flex items-center gap-1"
				onsubmit={(e) => {
					e.preventDefault();
					editState.run((ed) =>
						ed.chain().focus().updateAttributes('image', { alt: altValue }).run()
					);
					editingAlt = false;
				}}
			>
				<input
					class="h-6 w-32 rounded border border-border bg-background px-2 text-xs"
					placeholder="Alt text"
					bind:value={altValue}
				/>
				<button type="submit" class="rounded px-2 py-1 text-xs font-medium hover:bg-muted">
					OK
				</button>
				<button
					type="button"
					class="rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted"
					onclick={() => (editingAlt = false)}
				>
					&times;
				</button>
			</form>
		{:else}
			<button
				class="rounded px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
				onclick={() => {
					altValue = editState.run((e) => e.getAttributes('image').alt) ?? '';
					editingAlt = true;
				}}
			>
				Alt
			</button>
		{/if}
	{/if}
</div>
