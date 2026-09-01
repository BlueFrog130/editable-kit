import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Workspace-only: @editable-kit/* resolve to TypeScript source in sibling packages, so
	// Vite has to serve them (fs.allow) and transform them rather than hand them to Node
	// (ssr.noExternal). Installed from npm they are compiled JS and neither line matters.
	ssr: { noExternal: [/^@editable-kit\//] },
	server: { fs: { allow: [searchForWorkspaceRoot(process.cwd())] } }
});
