<script lang="ts">
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const navLinks = [
		{ href: '/admin', label: 'Dashboard', icon: '📊' },
		{ href: '/admin/products', label: 'Products', icon: '🧶' },
		{ href: '/admin/orders', label: 'Orders', icon: '📦' },
		{ href: '/admin/categories', label: 'Categories', icon: '🏷️' }
	];
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside
		class="flex w-60 flex-shrink-0 flex-col bg-on-surface text-surface-card"
		style="background: #153430;"
	>
		<div class="border-b border-white/10 px-6 py-6">
			<p class="font-display text-lg font-semibold text-white">Krafted Loops</p>
			<p class="mt-0.5 font-body text-xs text-white/50">Studio Admin</p>
		</div>

		<nav class="flex-1 space-y-1 px-3 py-4" aria-label="Admin navigation">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-2xl px-4 py-2.5 font-body text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
				>
					<span aria-hidden="true">{link.icon}</span>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-white/10 px-6 py-4">
			<a href="/" class="font-body text-xs text-white/40 hover:text-white/70">← Back to Shop</a>
			<p class="mt-1 font-body text-xs text-white/30">{data.user?.email}</p>
		</div>
	</aside>

	<!-- Main content -->
	<main class="flex-1 overflow-auto bg-surface">
		{@render children()}
	</main>
</div>
