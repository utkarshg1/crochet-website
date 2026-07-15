<script lang="ts">
	const policies = [
		{
			icon: '📦',
			title: 'Processing Time',
			lines: [
				'All items are made to order — crafted fresh just for you.',
				'Dispatch typically takes 3–5 business days after order confirmation.',
				"You'll receive an email notification with tracking details once your order ships."
			]
		},
		{
			icon: '🚚',
			title: 'Shipping Charges',
			lines: [
				'Shipping charges are extra and calculated at actuals based on your location and package weight.',
				'The shipping cost will be displayed at checkout before you confirm your order.',
				'We ship across India via trusted courier partners.'
			]
		},
		{
			icon: '📅',
			title: 'Estimated Delivery',
			lines: [
				'Metro cities: 5–7 business days after dispatch.',
				'Other locations: 7–10 business days after dispatch.',
				'Delivery timelines are estimates and may vary due to holidays or unforeseen delays.'
			]
		},
		{
			icon: '🚫',
			title: 'Return Policy',
			lines: [
				'All sales are final — we do not accept returns or exchanges.',
				'Each product is handmade and unique, making it one-of-a-kind. We encourage you to review product details carefully before purchasing.',
				"If you have any concerns about your order, please reach out to us and we'll do our best to help."
			]
		},
		{
			icon: '⚠️',
			title: 'Damaged or Wrong Items',
			lines: [
				'If your order arrives damaged or you receive the wrong item, please contact us within 48 hours of delivery.',
				'Share your order ID and clear photos of the issue via email or WhatsApp.',
				"We'll assess the situation and work with you on a resolution."
			]
		}
	];
</script>

<svelte:head>
	<title>Shipping & Returns — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Shipping and return policies for Krafted Loops Studio. Learn about processing times, delivery estimates, and our handmade product policies."
	/>
</svelte:head>

<!-- HERO -->
<section class="relative overflow-hidden bg-surface py-20 md:py-28">
	<div
		class="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-24 -left-24 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-4xl px-6 text-center md:px-10 lg:px-16">
		<p class="mb-3 font-body text-xs font-semibold tracking-widest text-secondary uppercase">
			Our Policies
		</p>
		<h1
			class="font-display text-5xl leading-tight font-bold text-on-surface md:text-6xl lg:text-7xl"
		>
			Shipping &<br /><span class="text-primary">Returns</span>
		</h1>
		<p
			class="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-on-surface-muted md:text-lg"
		>
			We put care into every stitch — and into getting your order to you safely. Here's what to
			expect.
		</p>
	</div>
</section>

<!-- POLICIES -->
<section class="bg-surface-low py-20 md:py-28">
	<div class="mx-auto max-w-4xl px-6 md:px-10 lg:px-16">
		<div class="flex flex-col gap-6">
			{#each policies as policy}
				<div class="shadow-ambient rounded-2xl bg-surface-card p-6 md:p-8">
					<div class="flex items-start gap-4">
						<span class="mt-0.5 shrink-0 text-3xl" aria-hidden="true">{policy.icon}</span>
						<div class="flex flex-col gap-3">
							<h2 class="font-display text-lg font-semibold text-on-surface md:text-xl">
								{policy.title}
							</h2>
							<ul class="flex flex-col gap-2" role="list">
								{#each policy.lines as line}
									<li class="flex items-start gap-2">
										<span class="mt-1.5 shrink-0 text-primary" aria-hidden="true">
											<svg viewBox="0 0 8 8" class="h-2 w-2" fill="currentColor"
												><circle cx="4" cy="4" r="4" /></svg
											>
										</span>
										<span class="font-body text-sm leading-relaxed text-on-surface-muted"
											>{line}</span
										>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Help CTA -->
		<div class="mt-12 text-center">
			<p class="mb-4 font-body text-sm text-on-surface-muted">Need help with an order?</p>
			<div class="flex flex-wrap justify-center gap-4">
				<a
					href="mailto:kraftedloopstudio@gmail.com"
					class="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3 font-body text-sm font-semibold text-primary
						   transition-all duration-200 hover:border-primary/50 hover:bg-primary/5
						   focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					Email Us
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M7 17L17 7M17 7H7M17 7v10" />
					</svg>
				</a>
				<a
					href="https://wa.me/918669326693"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 rounded-full bg-secondary-container px-6 py-3 font-body text-sm font-semibold text-on-surface
						   transition-all duration-200 hover:brightness-95
						   focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					WhatsApp Us
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M7 17L17 7M17 7H7M17 7v10" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</section>
