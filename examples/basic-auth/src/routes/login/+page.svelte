<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Sign in to access the admin editor.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				{#if form?.error}
					<div class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{form.error}
					</div>
				{/if}
				<div class="space-y-2">
					<label for="username" class="text-sm font-medium">Username</label>
					<Input
						id="username"
						name="username"
						type="text"
						autocomplete="username"
						required
						value={form?.username ?? ''}
					/>
				</div>
				<div class="space-y-2">
					<label for="password" class="text-sm font-medium">Password</label>
					<Input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
					/>
				</div>
				<Button type="submit" class="w-full">Sign In</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
