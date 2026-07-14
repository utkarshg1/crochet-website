# Krafted Loops Studio

Handmade crochet e-commerce website built with SvelteKit 2, Tailwind CSS v4, and Supabase.

## Tech Stack

- **Framework:** SvelteKit 2 (Svelte 5.54)
- **Styling:** Tailwind CSS v4 with custom brand theme
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (product images)
- **Payments:** Razorpay
- **Deployment:** Vercel

## Features

### Storefront
- Product catalog with category filtering, search, and sort
- Product detail pages with image gallery, color variants, and size selection
- Shopping cart with persistent state
- Checkout flow with Razorpay integration
- Order tracking

### Admin Dashboard
- Product management (CRUD with image uploads)
- Category management
- Order management with status updates

### Pages
- **Home** — Hero with logo + product images, collections grid, featured products, meet the maker, newsletter
- **Shop** — Full catalog with sidebar filters, search, mobile filter drawer
- **About** — Owner story, Instagram QR code, creator credits
- **Cart** — Item management, quantity updates
- **Checkout** — Address form, Razorpay payment
- **Account** — User profile, order history

### Design & UX
- Custom brand palette (teal surfaces, primary rose, secondary teal, tertiary amber)
- Organic mask shapes on images
- Ambient tonal shadows
- Glassmorphic navigation bar
- Logo hover animations (playful wobble + scale)
- Lightbox zoom on product images and owner photo
- Responsive mobile-first design
- ARIA-compliant accessible components

### Database Schema
- `profiles` — User profiles with admin flag
- `categories` — Product categories with display order
- `products` — Full product data (price, stock, images, colors, sizes)
- `orders` — Order tracking with auto-generated order numbers (KL-XXXX)
- `discounts` — Discount codes
- `carts` — Persistent shopping carts
- `newsletter_subscribers` — Email newsletter signups

### Security
- Row Level Security (RLS) on all tables
- Role-based access (anon, authenticated, admin)
- Secure function search paths
- Storage bucket policies (public read, admin write)

## Getting Started

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Environment Variables

See `.env.example` for required Supabase and Razorpay keys.

## Credits

- **Maker:** Kalyani Gaikwad — [Instagram](https://instagram.com/krafted_loops_studio)
- **Website by:** Utkarsh Gaikwad
