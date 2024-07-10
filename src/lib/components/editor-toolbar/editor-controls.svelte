<script lang="ts">
	import {
		ToggleBlockquote,
		ToggleMark,
		ToggleBulletList,
		ToggleHeading,
		ToggleOrderedList
	} from '$lib/components/editor-tools/index.js';
	import { editor } from '$lib/index.js';
	import Bold from 'lucide-svelte/icons/bold';
	import Italic from 'lucide-svelte/icons/italic';
	import Heading from 'lucide-svelte/icons/heading';
	import Quote from 'lucide-svelte/icons/quote';
	import List from 'lucide-svelte/icons/list';
	import ListOrdered from 'lucide-svelte/icons/list-ordered';

	const view = $derived(editor.view);
	const editorState = $derived(view?.state);
</script>

<div class="sticky top-0 z-10 sm:py-4 sm:px-4">
	<div
		class="max-w-screen-lg mx-auto px-2 backdrop-blur-sm bg-white bg-opacity-95 border-b border-t sm:border sm:rounded-full border-gray-100 shadow"
	>
		<div>
			<div class="flex items-center overflow-x-auto py-3 px-1">
				{#if editorState}
					<div class="flex">
						<ToggleMark type="strong">
							<Bold class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleMark>
						<ToggleMark type="em">
							<Italic class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleMark>
						<!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
						<!-- <CreateLink>
							<svg
								class="h-3 w-3 sm:h-4 sm:w-4"
								fill="currentColor"
								stroke="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 640 512"
								><path
									d="M562.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L405.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C189.5 251.2 196 330 246 380c56.5 56.5 148 56.5 204.5 0L562.8 267.7zM43.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C57 372 57 321 88.5 289.5L200.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C416.5 260.8 410 182 360 132c-56.5-56.5-148-56.5-204.5 0L43.2 244.3z"
								/></svg
							>
						</CreateLink> -->
						<div class="hidden sm:block w-px bg-gray-300 mx-3"></div>
						<ToggleHeading>
							<Heading class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleHeading>
						<ToggleBlockquote>
							<Quote class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleBlockquote>
						<div class="hidden sm:block w-px bg-gray-300 mx-3"></div>
						<ToggleBulletList>
							<List class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleBulletList>
						<ToggleOrderedList>
							<ListOrdered class="h-3 w-3 sm:h-4 sm:w-4" />
						</ToggleOrderedList>
						<div class="hidden sm:block w-px bg-gray-300 mx-3"></div>
						<!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
						<!-- <InsertImage>
							<svg
								class="h-3 w-3 sm:h-4 sm:w-4"
								fill="currentColor"
								stroke="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 512 512"
								><path
									d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
								/></svg
							>
						</InsertImage> -->
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
