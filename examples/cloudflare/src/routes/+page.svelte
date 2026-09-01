<script lang="ts">
	import Content from './content.svelte';
	let { data } = $props();
</script>

<Content content={data.content} editing={false} />

<div class="bar">
	<div class="grow"></div>
	<a class="btn" href="/admin">Edit</a>
</div>
