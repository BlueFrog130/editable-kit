<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import { Editor, rich, type EditorComponentProps } from '../editor/index.js';

	let { content, ...props }: EditorComponentProps = $props();
</script>

<Editor {content} extensions={rich} {...editor.props} {...props} />
