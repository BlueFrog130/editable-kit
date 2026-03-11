<script lang="ts">
	import Content from './Content.svelte';
	import { getData } from './data.remote';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<Content data={await getData()} editing={false} />
<div class="fixed right-4 bottom-4">
	<Button variant="outline" size="sm" href="/admin">Edit</Button>
</div>
