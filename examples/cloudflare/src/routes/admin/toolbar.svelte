<script lang="ts">
	import { pickFile, type EditableState } from '@editable-kit/svelte';

	let {
		state: editState,
		token,
		error,
		onsave,
		oncancel
	}: {
		state: EditableState | undefined;
		token: string;
		error: string;
		onsave: () => Promise<void>;
		oncancel: () => void;
	} = $props();

	const bold = $derived(editState?.command('bold', (e) => e.chain().focus().toggleBold().run()));
	const italic = $derived(
		editState?.command('italic', (e) => e.chain().focus().toggleItalic().run())
	);

	let busy = $state(false);

	async function replaceImage() {
		const file = await pickFile();
		if (!file || !editState) return;

		busy = true;
		try {
			const form = new FormData();
			form.append('file', file);
			const res = await fetch('/api/assets', {
				method: 'POST',
				headers: { authorization: `Bearer ${token}` },
				body: form
			});
			if (!res.ok) throw new Error(`Upload failed (${res.status})`);
			const { url } = (await res.json()) as { url: string };
			editState.run((e) => e.chain().focus().setImage({ src: url }).run());
		} finally {
			busy = false;
		}
	}
</script>

<div class="bar">
	<button aria-pressed={bold?.isActive ?? false} disabled={!bold?.has} onclick={bold?.run}>
		<b>B</b>
	</button>
	<button aria-pressed={italic?.isActive ?? false} disabled={!italic?.has} onclick={italic?.run}>
		<i>I</i>
	</button>
	<button disabled={!editState?.has('image') || busy} onclick={replaceImage}>
		{busy ? 'Uploading…' : 'Replace image'}
	</button>

	<span class="grow" style="color:#dc2626">{error}</span>

	<button onclick={oncancel}>Cancel</button>
	<button onclick={onsave}>Save</button>
</div>
