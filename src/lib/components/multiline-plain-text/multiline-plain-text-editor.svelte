<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import { Editor, multiline, type EditorComponentProps } from '../editor/index.js';

	let { content, ...props }: EditorComponentProps = $props();
</script>

<Editor {content} extensions={multiline} {...editor.props} {...props} />
