<script lang="ts">
	import { goto } from '$app/navigation';
	import Content from '../Content.svelte';
	import { getData, updateData } from '../data.remote';
	import Toolbar from './toolbar.svelte';

	let data = $state(await getData());

	// `Root` hands over a plain snapshot of the same object the fields wrote into.
	async function handleSave(saved: typeof data) {
		await updateData(saved);
		goto('/');
	}
</script>

<Content bind:data editing={true} onsave={handleSave}>
	{#snippet toolbar(state, save)}
		<Toolbar {state} onsave={save} oncancel={() => goto('/')} />
	{/snippet}
</Content>
