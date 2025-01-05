<script lang="ts">
	import { editor } from '$lib/state/index.js';
	import { Editor, plain, type EditorComponentProps } from '../editor/index.js';

	let { content, ...props }: EditorComponentProps = $props();
</script>

<div class="contents [&_.ProseMirror]:inline-block">
	<Editor {content} extensions={plain} {...editor.props} {...props} />
</div>
