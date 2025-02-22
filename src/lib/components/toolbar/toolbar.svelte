<script lang="ts">
	import Bold from 'lucide-svelte/icons/bold';
	import Italic from 'lucide-svelte/icons/italic';
	import Heading from 'lucide-svelte/icons/heading';
	import type { ComponentType } from 'svelte';
	import { type Icon } from 'lucide-svelte';
	import type { Editor } from '@tiptap/core';
	import { flip, offset, shift } from '@floating-ui/dom';
	import Heading1 from 'lucide-svelte/icons/heading-1';
	import Heading2 from 'lucide-svelte/icons/heading-2';
	import Heading3 from 'lucide-svelte/icons/heading-3';
	import Link from 'lucide-svelte/icons/link';
	import Check from 'lucide-svelte/icons/check';
	import Delete from 'lucide-svelte/icons/x';
	import Strikethrough from 'lucide-svelte/icons/strikethrough';
	import Underline from 'lucide-svelte/icons/underline';
	import Save from 'lucide-svelte/icons/save';
	import Image from 'lucide-svelte/icons/image';
	import ArrowUpToLine from 'lucide-svelte/icons/arrow-up-to-line';
	import ArrowDownToLine from 'lucide-svelte/icons/arrow-down-to-line';
	import { Menu } from '../ui/floating/index.js';
	import type { Editable, MaybePromise } from '$lib/types.js';
	import { fly } from 'svelte/transition';
	import type { ToolbarState } from '$lib/state/toolbar-state.svelte.js';

	let { onsave, state: toolbarState }: { onsave: () => MaybePromise<void>; state: ToolbarState } =
		$props();

	type Value<T> = { value: T };

	type Tool = {
		icon: ComponentType<Icon>;
		disabled: Value<boolean>;
		active: Value<boolean>;
		action: (editor: Editable) => any;
	};

	const toolbarStyling = 'shadow-md rounded flex p-1 gap-1';

	let hidden = $state(false);

	const active = (tool: string, attributes?: {}) => {
		return {
			get value() {
				return toolbarState.isActive(tool, attributes);
			}
		};
	};

	const disabled = (tool: string) => {
		return {
			get value() {
				return !toolbarState.has(tool);
			}
		};
	};

	const textAction = (fn: (editor: Editor) => any) => (editable: Editable) => {
		if (editable.type !== 'text') return;
		fn(editable.editor);
	};

	const tool = (
		icon: ComponentType<Icon>,
		tool: string,
		fn: (editor: Editor) => any,
		attributes?: {}
	): Tool => {
		const action = (editable: Editable) => {
			if (editable.type !== 'text') return;
			fn(editable.editor);
		};
		return { icon, disabled: disabled(tool), active: active(tool, attributes), action };
	};

	const tools: Tool[] = [
		tool(Bold, 'bold', (e) => e.chain().focus().toggleBold().run()),
		tool(Italic, 'italic', (e) => e.chain().focus().toggleItalic().run()),
		tool(Underline, 'underline', (e) => e.chain().focus().toggleUnderline().run()),
		tool(Strikethrough, 'strike', (e) => e.chain().focus().toggleStrike().run())
	];

	const headingLevels: Tool[] = [
		tool(Heading1, 'heading', (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), {
			level: 1
		}),
		tool(Heading2, 'heading', (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), {
			level: 2
		}),
		tool(Heading3, 'heading', (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), {
			level: 3
		})
	];
</script>

{#snippet divider()}
	<div class="w-[1px] bg-neutral-3"></div>
{/snippet}

<div class="container mx-auto fixed z-40 top-0 left-0 right-0">
	{#if !hidden}
		<div
			transition:fly={{ y: -48, opacity: 1, duration: 200 }}
			class={[toolbarStyling, 'bg-white mt-4 absolute w-full']}
		>
			{#each tools as { icon: Icon, disabled, active, action }}
				<button
					class={['p-2 disabled:text-neutral-4 rounded', active.value && 'bg-neutral-2']}
					disabled={disabled.value}
					onclick={() => action(toolbarState.active!)}
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
					{@const a = active('heading')}
					{@const d = disabled('heading')}
					<button
						class="p-2 disabled:text-neutral-4 rounded"
						class:bg-neutral-2={a.value}
						use:reference
						disabled={d.value}
						onclick={toggle()}
					>
						<Heading class="h-4 w-4" />
					</button>
				{/snippet}
				{#snippet menu(action, { close })}
					<div class="absolute w-[max-content] top-0 left-0 bg-white {toolbarStyling}" use:action>
						{#each headingLevels as { icon: Icon, disabled, active, action }}
							<button
								class="p-2 disabled:text-neutral-4 rounded"
								class:bg-neutral-2={active.value}
								disabled={disabled.value}
								onclick={close(() => action(toolbarState.active!))}
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
					{@const a = active('link')}
					{@const d = disabled('link')}
					<button
						class={['p-2 disabled:text-neutral-4 rounded', a.value && 'bg-neutral-2']}
						use:reference
						disabled={d.value}
						onclick={toggle()}
					>
						<Link class="h-4 w-4" />
					</button>
				{/snippet}
				{#snippet menu(action, { close })}
					<form
						class={['absolute w-[max-content] top-0 left-0 bg-white z-40', toolbarStyling]}
						use:action
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
							class="p-2 w-full min-w-[10rem]"
							placeholder="https://"
							name="href"
							value={toolbarState.text((e) => e.getAttributes('link').href)}
						/>
						<button type="submit" class="p-2 disabled:text-neutral-4 rounded">
							<Check class="w-4 h-4" />
						</button>
						<button
							type="button"
							class="p-2 disabled:text-neutral-4 rounded"
							onclick={close(() => toolbarState.text((e) => e?.chain().focus().unsetLink().run()))}
						>
							<Delete class="w-4 h-4" />
						</button>
					</form>
				{/snippet}
			</Menu>
			{@render divider()}
			<button
				class="p-2 disabled:text-neutral-4 rounded"
				disabled={toolbarState.active?.type !== 'image'}
				onclick={() => {
					if (toolbarState.active?.type === 'image') toolbarState.active.editor.replaceImage();
				}}
			>
				<Image class="h-4 w-4" />
			</button>

			<div class="flex-grow"></div>

			<button onclick={() => (hidden = !hidden)} class="p-2 disabled:text-neutral-4 rounded">
				<ArrowUpToLine class="h-4 w-4" />
			</button>
			<button onclick={onsave} class="p-2 disabled:text-neutral-4 rounded">
				<Save class="h-4 w-4" />
			</button>
		</div>
	{:else}
		<button
			transition:fly={{ duration: 200, y: -32 }}
			class="bg-white p-2 shadow-md right-0 absolute rounded-b"
			onclick={() => (hidden = !hidden)}
		>
			<ArrowDownToLine class="h-4 w-4" />
		</button>
	{/if}
</div>
