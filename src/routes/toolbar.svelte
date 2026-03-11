<script lang="ts">
	import Bold from 'lucide-svelte/icons/bold';
	import Italic from 'lucide-svelte/icons/italic';
	import Heading from 'lucide-svelte/icons/heading';
	import type { ComponentType } from 'svelte';
	import { type Icon } from 'lucide-svelte';
	import { flip, offset, shift } from '@floating-ui/dom';
	import Heading1 from 'lucide-svelte/icons/heading-1';
	import Heading2 from 'lucide-svelte/icons/heading-2';
	import Heading3 from 'lucide-svelte/icons/heading-3';
	import Link from 'lucide-svelte/icons/link';
	import Check from 'lucide-svelte/icons/check';
	import Delete from 'lucide-svelte/icons/x';
	import Strikethrough from 'lucide-svelte/icons/strikethrough';
	import Underline from 'lucide-svelte/icons/underline';
	import Ban from 'lucide-svelte/icons/ban';
	import Save from 'lucide-svelte/icons/save';
	import Image from 'lucide-svelte/icons/image';
	import TextCursorInput from 'lucide-svelte/icons/text-cursor-input';
	import { Menu } from './components/ui/floating/index.js';
	import { fly } from 'svelte/transition';
	import type {
		EditableCommand,
		EditableState
	} from '$lib/components/editable/editable-state.svelte.js';

	let {
		onsave,
		oncancel,
		state: toolbarState
	}: { onsave: () => unknown; oncancel: () => unknown; state: EditableState } = $props();

	type Tool = {
		icon: ComponentType<Icon>;
		cmd: EditableCommand;
		label: string;
	};

	const toolbarStyling = 'shadow-md rounded flex p-1 gap-1';

	let hidden = $state(false);

	const tools: Tool[] = $derived([
		{
			icon: Bold,
			label: 'Bold',
			cmd: toolbarState.command('bold', (e) => e.chain().focus().toggleBold().run())
		},
		{
			icon: Italic,
			label: 'Italic',
			cmd: toolbarState.command('italic', (e) => e.chain().focus().toggleItalic().run())
		},
		{
			icon: Underline,
			label: 'Underline',
			cmd: toolbarState.command('underline', (e) => e.chain().focus().toggleUnderline().run())
		},
		{
			icon: Strikethrough,
			label: 'Strikethrough',
			cmd: toolbarState.command('strike', (e) => e.chain().focus().toggleStrike().run())
		}
	]);

	const headingCmd = $derived(toolbarState.command('heading', () => {}));

	const headingLevels: Tool[] = $derived([
		{
			icon: Heading1,
			label: 'Heading 1',
			cmd: toolbarState.command(
				'heading',
				(e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
				{ level: 1 }
			)
		},
		{
			icon: Heading2,
			label: 'Heading 2',
			cmd: toolbarState.command(
				'heading',
				(e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
				{ level: 2 }
			)
		},
		{
			icon: Heading3,
			label: 'Heading 3',
			cmd: toolbarState.command(
				'heading',
				(e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
				{ level: 3 }
			)
		}
	]);

	const linkCmd = $derived(toolbarState.command('link', () => {}));
</script>

{#snippet divider()}
	<div class="bg-neutral-3 w-px" role="separator"></div>
{/snippet}

<div class="fixed top-16 right-0 left-0 z-40 mx-auto max-w-xl px-4">
	<div
		transition:fly={{ y: -48, opacity: 1, duration: 200 }}
		class={[toolbarStyling, 'absolute mt-4 w-full bg-white']}
		role="toolbar"
		aria-label="Text formatting"
	>
		{#each tools as { icon: Icon, cmd, label }}
			<button
				class={['rounded p-2 disabled:text-neutral-400', cmd.isActive && 'bg-neutral-200']}
				disabled={!cmd.has}
				onclick={cmd.run}
				aria-label={label}
				aria-pressed={cmd.isActive}
			>
				<Icon class="h-4 w-4" />
			</button>
		{/each}
		{@render divider()}
		<Menu
			config={{
				placement: 'bottom',
				middleware: [flip(), shift(), offset(6)]
			}}
		>
			{#snippet trigger(reference, { toggle })}
				<button
					class="rounded p-2 disabled:text-neutral-400"
					class:bg-neutral-2={headingCmd.isActive}
					{@attach reference}
					disabled={!headingCmd.has}
					onclick={toggle()}
					aria-label="Headings"
					aria-pressed={headingCmd.isActive}
					aria-haspopup="true"
				>
					<Heading class="h-4 w-4" />
				</button>
			{/snippet}
			{#snippet menu(action, { close })}
				<div
					class="absolute top-0 left-0 w-max bg-white {toolbarStyling}"
					{@attach action}
					role="group"
					aria-label="Heading levels"
				>
					{#each headingLevels as { icon: Icon, cmd, label }}
						<button
							class="rounded p-2 disabled:text-neutral-400"
							class:bg-neutral-2={cmd.isActive}
							disabled={!cmd.has}
							onclick={close(cmd.run)}
							aria-label={label}
							aria-pressed={cmd.isActive}
						>
							<Icon class="h-4 w-4" />
						</button>
					{/each}
				</div>
			{/snippet}
		</Menu>
		<Menu
			config={{
				placement: 'bottom',
				middleware: [flip(), shift(), offset(6)]
			}}
		>
			{#snippet trigger(reference, { toggle })}
				<button
					class={['rounded p-2 disabled:text-neutral-400', linkCmd.isActive && 'bg-neutral-200']}
					{@attach reference}
					disabled={!linkCmd.has}
					onclick={toggle()}
					aria-label="Link"
					aria-pressed={linkCmd.isActive}
					aria-haspopup="true"
				>
					<Link class="h-4 w-4" />
				</button>
			{/snippet}
			{#snippet menu(action, { close })}
				<form
					class={['absolute top-0 left-0 z-40 w-max bg-white', toolbarStyling]}
					{@attach action}
					aria-label="Link URL"
					onsubmit={(e) => {
						e.preventDefault();
						const href = (e.target as HTMLFormElement).href.value;
						const closeFn = close(() => {
							const chain = toolbarState.text((e) => e.chain().focus().extendMarkRange('link'));
							return href ? chain?.setLink({ href }).run() : chain?.unsetLink().run();
						});
						closeFn();
					}}
				>
					<input
						class="w-full min-w-40 p-2"
						placeholder="https://"
						name="href"
						aria-label="Link URL"
						value={toolbarState.text((e) => e.getAttributes('link').href)}
					/>
					<button
						type="submit"
						class="rounded p-2 disabled:text-neutral-400"
						aria-label="Apply link"
					>
						<Check class="h-4 w-4" />
					</button>
					<button
						type="button"
						class="rounded p-2 disabled:text-neutral-400"
						aria-label="Remove link"
						onclick={close(() => toolbarState.text((e) => e?.chain().focus().unsetLink().run()))}
					>
						<Delete class="h-4 w-4" />
					</button>
				</form>
			{/snippet}
		</Menu>
		{@render divider()}
		<button
			class="rounded p-2 disabled:text-neutral-400"
			disabled={!toolbarState.isImage}
			onclick={() => toolbarState.replaceImage()}
			aria-label="Replace image"
		>
			<Image class="h-4 w-4" />
		</button>
		<Menu
			config={{
				placement: 'bottom',
				middleware: [flip(), shift(), offset(6)]
			}}
		>
			{#snippet trigger(reference, { toggle })}
				<button
					class="rounded p-2 disabled:text-neutral-400"
					{@attach reference}
					disabled={!toolbarState.isImage}
					onclick={toggle()}
					aria-label="Image alt text"
					aria-haspopup="true"
				>
					<TextCursorInput class="h-4 w-4" />
				</button>
			{/snippet}
			{#snippet menu(action, { close })}
				<form
					class={['absolute top-0 left-0 z-40 w-max bg-white', toolbarStyling]}
					{@attach action}
					aria-label="Image alt text"
					onsubmit={(e) => {
						e.preventDefault();
						const alt = (e.target as HTMLFormElement).alt.value;
						const closeFn = close(() => {
							toolbarState.setImageAlt(alt);
						});
						closeFn();
					}}
				>
					<input
						class="w-full min-w-40 p-2"
						placeholder="Alt text"
						name="alt"
						aria-label="Image alt text"
						value={toolbarState.getImageAlt() ?? ''}
					/>
					<button
						type="submit"
						class="rounded p-2 disabled:text-neutral-400"
						aria-label="Apply alt text"
					>
						<Check class="h-4 w-4" />
					</button>
					<button
						type="button"
						class="rounded p-2 disabled:text-neutral-400"
						aria-label="Clear alt text"
						onclick={close(() => toolbarState.setImageAlt(''))}
					>
						<Delete class="h-4 w-4" />
					</button>
				</form>
			{/snippet}
		</Menu>

		<div class="grow"></div>

		<button onclick={oncancel} class="rounded p-2 disabled:text-neutral-400" aria-label="Cancel">
			<Ban class="h-4 w-4" />
		</button>
		<button onclick={onsave} class="rounded p-2 disabled:text-neutral-400" aria-label="Save">
			<Save class="h-4 w-4" />
		</button>
	</div>
</div>
