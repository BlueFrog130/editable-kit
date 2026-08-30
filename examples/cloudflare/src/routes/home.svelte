<script lang="ts">
	import type { HomeContent } from '$lib/content';
	import * as Editable from 'editable-kit';

	let { content = $bindable() }: { content: HomeContent } = $props();
</script>

<h1><Editable.Text bind:value={content.title} /></h1>
<Editable.Image bind:value={content.hero} />
<Editable.Rich bind:value={content.body} />
