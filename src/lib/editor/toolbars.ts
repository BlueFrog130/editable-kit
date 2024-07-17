import {
	Divider,
	ToggleBlockquote,
	ToggleBulletList,
	ToggleEmMark,
	ToggleHeading,
	ToggleOrderedList,
	ToggleStrongMark,
	type EditorToolProps
} from '$lib/components/editor-tools/index.js';
import type { Component, ComponentProps } from 'svelte';

export type Tool<T extends Component<any>> = [T, ComponentProps<T>];
export const textToolbar = ({ view, state }: EditorToolProps) => [
	tool(ToggleStrongMark, { state, view }),
	tool(ToggleEmMark, { state, view }),
	tool(Divider, {}),
	tool(ToggleHeading, { state, view }),
	tool(ToggleBlockquote, { state, view }),
	tool(ToggleBulletList, { state, view }),
	tool(ToggleOrderedList, { state, view })
];

export function tool<T extends Component<any>>(component: T, props: ComponentProps<T>): Tool<T> {
	return [component, props];
}
