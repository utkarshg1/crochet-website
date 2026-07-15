<script lang="ts">
	let openIndex = $state<number | null>(null);

	function toggle(index: number) {
		openIndex = openIndex === index ? null : index;
	}

	const faqs = [
		{
			question: 'Are all products handmade?',
			answer:
				'Yes! Every single piece at Krafted Loops Studio is handcrafted by Kalyani Gaikwad. No machines, no mass production — just hands, hooks, and a whole lot of love.'
		},
		{
			question: 'What materials do you use?',
			answer:
				'We use a mix of natural cotton, premium acrylic yarn, and blended fibers depending on the product. All materials are chosen for softness, durability, and color vibrancy. Specific material details are listed on each product page.'
		},
		{
			question: 'How long does shipping take?',
			answer:
				"Most items are made to order and dispatched within 3–5 business days. Delivery within India typically takes 5–7 business days for metro cities and 7–10 business days for other locations. You'll receive a tracking notification via email once your order ships."
		},
		{
			question: 'Do you accept custom orders?',
			answer:
				"Absolutely! We love bringing your ideas to life. Whether it's a specific color, size, or design, reach out to us via email or WhatsApp and we'll discuss the details."
		},
		{
			question: 'What payment methods are accepted?',
			answer:
				'We accept UPI, debit/credit cards, net banking, and popular wallets through our secure Razorpay payment gateway. All transactions are encrypted and safe.'
		},
		{
			question: 'Can I cancel or modify my order?',
			answer:
				"You can request a cancellation or modification only before the order has been dispatched. Once dispatch has occurred, we're unable to make changes. Please contact us as soon as possible via WhatsApp or email."
		},
		{
			question: 'How do I care for my crochet items?',
			answer:
				'To keep your crochet pieces looking their best, we recommend hand washing in cold water with a mild detergent. Lay flat to dry away from direct sunlight. Avoid wringing or twisting. With proper care, your handmade items will last for years.'
		},
		{
			question: 'Do you ship internationally?',
			answer:
				"Currently, we only ship within India. We're working on expanding to international shipping in the future. Stay tuned by following us on Instagram!"
		},
		{
			question: 'Where are you located?',
			answer:
				'Krafted Loops Studio is based in Pune, Maharashtra, India. All products are crafted right here in our home studio.'
		}
	];
</script>

<svelte:head>
	<title>FAQ — Krafted Loops Studio</title>
	<meta
		name="description"
		content="Frequently asked questions about Krafted Loops Studio — shipping, custom orders, materials, care instructions, and more."
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
			Got Questions?
		</p>
		<h1
			class="font-display text-5xl leading-tight font-bold text-on-surface md:text-6xl lg:text-7xl"
		>
			Frequently Asked<br /><span class="text-primary">Questions</span>
		</h1>
		<p
			class="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-on-surface-muted md:text-lg"
		>
			Everything you need to know about shopping with Krafted Loops Studio. Can't find your answer?
			Reach out on WhatsApp or email us.
		</p>
	</div>
</section>

<!-- FAQ ACCORDION -->
<section class="bg-surface-low py-20 md:py-28">
	<div class="mx-auto max-w-3xl px-6 md:px-10 lg:px-16">
		<div class="flex flex-col gap-4">
			{#each faqs as faq, i}
				<div class="shadow-ambient overflow-hidden rounded-2xl bg-surface-card">
					<button
						type="button"
						onclick={() => toggle(i)}
						class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
						aria-expanded={openIndex === i}
					>
						<span class="font-display text-base font-semibold text-on-surface">{faq.question}</span>
						<svg
							class="h-5 w-5 shrink-0 text-on-surface-muted transition-transform duration-200 {openIndex ===
							i
								? 'rotate-180'
								: ''}"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
					{#if openIndex === i}
						<div class="px-6 pb-5">
							<p class="font-body text-sm leading-relaxed text-on-surface-muted">
								{faq.answer}
							</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Contact CTA -->
		<div class="mt-12 text-center">
			<p class="mb-4 font-body text-sm text-on-surface-muted">Still have questions?</p>
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
