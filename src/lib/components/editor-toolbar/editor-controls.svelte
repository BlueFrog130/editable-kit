<script lang="ts">
	import { editor } from '$lib/index.js';
</script>

<div class="sticky top-0 z-10 sm:py-4 sm:px-4">
	<div
		class="max-w-screen-lg mx-auto px-2 backdrop-blur-sm bg-white bg-opacity-95 border-b border-t sm:border sm:rounded-full border-gray-100 shadow"
	>
		<div>
			<div class="flex items-center overflow-x-auto py-3 px-1">
				{#if editor.tools}
					<div class="flex">
						{#each editor.tools as [tool, props]}
							<svelte:component this={tool} {...props} />
						{/each}
					</div>
				{/if}

				<div class="flex-1 h-8"></div>
				<button type="button">Cancel</button>
				<div class="shrink-0 w-2 sm:w-4"></div>
				<button type="button">Save</button>
			</div>
		</div>
	</div>
</div>
