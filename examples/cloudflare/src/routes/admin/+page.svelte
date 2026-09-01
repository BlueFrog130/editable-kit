<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import Content from '../content.svelte';
	import Toolbar from './toolbar.svelte';
	import type { Content as ContentData } from '$lib/content';

	let { data } = $props();
	// One working copy, snapshotted once: edits must not write into the load data.
	let content = $state(untrack(() => structuredClone(data.content)));
	let token = $state(sessionStorage.getItem('ek-token') ?? '');
	let error = $state('');

	async function save(saved: ContentData) {
		error = '';
		const res = await fetch('/api/content', {
			method: 'PUT',
			headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
			body: JSON.stringify(saved)
		});
		if (!res.ok) {
			error = res.status === 401 ? 'Wrong admin token.' : `Save failed (${res.status})`;
			throw new Error(error);
		}
		goto('/', { invalidateAll: true });
	}
</script>

{#if token}
	<Content bind:content editing={true} onsave={save}>
		{#snippet toolbar(state, onsave)}
			<Toolbar {state} {onsave} {token} {error} oncancel={() => goto('/')} />
		{/snippet}
	</Content>
{:else}
	<article>
		<h1>Admin</h1>
		<p class="tagline">Enter the <code>ADMIN_TOKEN</code> this Worker was deployed with.</p>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				const value = new FormData(e.currentTarget).get('token') as string;
				sessionStorage.setItem('ek-token', value);
				token = value;
			}}
		>
			<input name="token" type="password" placeholder="Admin token" autocomplete="off" />
			<button type="submit">Continue</button>
		</form>
	</article>
{/if}
