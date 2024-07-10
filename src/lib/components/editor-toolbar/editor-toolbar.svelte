<script lang="ts">
	import { editor } from '$lib/index.js';
</script>

{#if editor.isEditing}
	{#await import('./editor-controls.svelte') then EditorControls}
		<EditorControls.default />
	{/await}
{/if}
