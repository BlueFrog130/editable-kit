<script lang="ts">
	import { goto } from '$app/navigation';
	import Content from '../Content.svelte';
	import { getData, updateData } from '../data.remote';
	import Toolbar from './toolbar.svelte';
	import type { SaveResult, EditorContent } from 'editable-kit';

	let data = $state(await getData());

	async function handleSave(allData: SaveResult) {
		const content = allData.get('content') as Record<string, EditorContent> | undefined;
		if (!content) return;

		async function imageField(field: EditorContent | undefined) {
			if (!field) throw new Error('Expected image field');
			if (field.type === 'image-src')
				return {
					src: field.src,
					alt: field.alt
				};
			if (field.type === 'image-blob')
				return {
					image: await field.blob.arrayBuffer(),
					alt: field.alt
				};
			throw new Error('Expected image field');
		}

		function textField(field: EditorContent | undefined) {
			if (!field || field.type !== 'text') throw new Error('Expected text field');
			return field.content;
		}

		const projectsData = (allData.get('projects') ?? []) as Record<string, EditorContent>[];
		const projects = await Promise.all(
			projectsData.map(async (project) => ({
				title: textField(project.title),
				desc: textField(project.desc),
				image: await imageField(project.image)
			}))
		);

		await updateData({
			name: textField(content.name),
			tagline: textField(content.tagline),
			avatar: await imageField(content.avatar),
			bio: textField(content.bio),
			about: textField(content.about),
			projects,
			footer: textField(content.footer)
		});

		goto('/');
	}
</script>

<Content bind:data editing={true} onsave={handleSave}>
	{#snippet toolbar(state, save)}
		<Toolbar {state} onsave={save} oncancel={() => goto('/')} />
	{/snippet}
</Content>
