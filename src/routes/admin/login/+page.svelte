<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head><title>Admin Login — Krafted Loops Studio</title></svelte:head>

<div class="flex min-h-screen items-center justify-center bg-surface px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
				<span class="text-2xl">🧶</span>
			</div>
			<h1 class="font-display text-2xl font-semibold text-on-surface">Admin Access</h1>
			<p class="mt-1 font-body text-sm text-on-surface-muted">Krafted Loops Studio</p>
		</div>

		<div class="shadow-ambient rounded-3xl bg-surface-card p-8">
			{#if form?.error}
				<div class="mb-4 rounded-2xl bg-primary/10 px-4 py-3 font-body text-sm text-primary">
					{form.error}
				</div>
			{/if}

			<p class="mb-5 font-body text-sm text-on-surface-muted">
				Sign in with your admin credentials.
			</p>

			<form
				method="POST"
				action="?/signIn"
				onsubmit={() => {
					loading = true;
				}}
				class="space-y-4"
			>
				<div>
					<label
						for="adm-email"
						class="mb-1.5 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Email</label
					>
					<input
						id="adm-email"
						name="email"
						type="email"
						required
						autocomplete="email"
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface ring-1 ring-transparent transition outline-none focus:ring-primary"
						placeholder="admin@example.com"
					/>
				</div>
				<div>
					<label
						for="adm-password"
						class="mb-1.5 block font-body text-xs font-semibold tracking-wider text-on-surface-muted uppercase"
						>Password</label
					>
					<input
						id="adm-password"
						name="password"
						type="password"
						required
						minlength="8"
						autocomplete="current-password"
						class="w-full rounded-2xl bg-surface-low px-4 py-3 font-body text-sm text-on-surface ring-1 ring-transparent transition outline-none focus:ring-primary"
						placeholder="••••••••"
					/>
				</div>
				<button
					type="submit"
					disabled={loading}
					class="shadow-ambient w-full rounded-full bg-gradient-to-r from-primary to-primary-dim py-3 font-body text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
				>
					{#if loading}
						<svg
							class="mr-2 inline h-[18px] w-[18px] animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
						>
							<circle cx="12" cy="12" r="9.5" stroke-width="1.5" opacity="0.2" />
							<path d="M7 9a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
							<path d="M5.5 13a7 7 0 0 1 13 0" stroke-width="1.5" opacity="0.7" />
							<path d="M7 17a5.5 5.5 0 0 1 10 0" stroke-width="1.5" opacity="0.7" />
							<path d="M19 7c1 1.5 0 3.5-2 3.5" stroke-width="1.5" opacity="0.4" />
						</svg>
						Signing In…
					{:else}
						Sign In
					{/if}
				</button>
			</form>
		</div>
		<p class="mt-6 text-center font-body text-xs text-on-surface-muted">
			<a href="/" class="hover:text-on-surface">← Back to store</a>
		</p>
	</div>
</div>
