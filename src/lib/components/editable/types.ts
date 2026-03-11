import type { EditorContent } from '../editor/index.js';

export type SaveResult = Map<
	string,
	Record<string, EditorContent> | Record<string, EditorContent>[]
>;
