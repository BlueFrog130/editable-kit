import {
	Divider,
	Reset,
	ToggleBlockquote,
	ToggleBulletList,
	ToggleEmMark,
	ToggleHeading,
	ToggleOrderedList,
	ToggleStrongMark,
	type EditorToolProps
} from '$lib/components/editor-tools/index.js';
import type { MaybePromise } from '@sveltejs/kit';
import type { Component, ComponentProps } from 'svelte';

export type Tool<T extends Component<any>> = [T, ComponentProps<T>];
export const textToolbar = ({
	view,
	state,
	reset
}: EditorToolProps & { reset: () => MaybePromise<void> }) => [
	tool(ToggleStrongMark, { state, view }),
	tool(ToggleEmMark, { state, view }),
	tool(Divider, {}),
	tool(ToggleHeading, { state, view }),
	tool(ToggleBlockquote, { state, view }),
	tool(ToggleBulletList, { state, view }),
	tool(ToggleOrderedList, { state, view }),
	tool(Divider, {}),
	tool(Reset, { onclick: reset })
];

export function tool<T extends Component<any>>(component: T, props: ComponentProps<T>): Tool<T> {
	return [component, props];
}
