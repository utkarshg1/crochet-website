<div align="center">

<img src="https://raw.githubusercontent.com/utkarshg1/crochet-website/main/src/lib/assets/Krafted%20Loops%20Circle%20Sticker.png" alt="Krafted Loops Studio Logo" width="240" />

# Krafted Loops Studio

**Handmade crochet e-commerce website — where every stitch tells a story.**

🌐 <a href="https://krafted-loops-studios.vercel.app/"><strong>krafted-loops-studios.vercel.app</strong></a>
&nbsp;&nbsp;·&nbsp;&nbsp;
📸 <a href="https://www.instagram.com/krafted_loops_studio"><strong>@krafted_loops_studio</strong></a>

<br />

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.50-blue?style=flat-square&logo=svelte&logoColor=white&color=a7295a)
![Svelte](https://img.shields.io/badge/Svelte-5.54-ff3e00?style=flat-square&logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.1-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-072653?style=flat-square&logo=razorpay&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?style=flat-square&logo=vercel&logoColor=white)
![Version](https://img.shields.io/badge/version-1.6.0-a7295a?style=flat-square)

</div>

---

## <div align="center">✨ Features</div>

<table>
  <tr>
    <td width="50%">

### 🛍️ Storefront

- Product catalog with category filtering, search & sort
- Image gallery with color variants & size selection
- Persistent shopping cart (localStorage + Supabase sync)
- Slide-in cart drawer
- Wishlist with heart toggle
- Razorpay checkout flow
- Guest checkout (no account required)
- Order tracking with auto-generated order numbers (KL-XXXX)
- OTP-based phone authentication

    </td>
    <td width="50%">

### 🛠️ Admin Dashboard

- Product CRUD with image uploads
- Category management with display ordering
- Order management with status updates
- Inventory tracking

    </td>
  </tr>
  <tr>
    <td>

### 📄 Pages

- **Home** — Hero, collections grid, featured products, meet the maker, testimonials, newsletter
- **Shop** — Full catalog with sidebar filters & mobile drawer
- **About** — Owner story & Instagram QR code
- **FAQ** — Accordion-style common questions
- **Shipping & Returns** — Policies & delivery estimates
- **Cart / Checkout / Account / Wishlist**

    </td>
    <td>

### 🎨 Design & UX

- Custom brand palette (teal surfaces, rose primary, accent colors)
- Glassmorphic navigation bar with ambient shadow
- Organic mask shapes for images
- Hydration-safe splash with SSR browser gate (no flash on Vercel)
- Splash-to-hero FLIP animation — logo rolls like a tire & settles into position
- 360° stationary spin on mobile with smooth overlay fade-out
- Hardware-accelerated Web Animations API with Fast Out, Slow In easing
- Font-aware layout guard preventing coordinate shift on reload
- Staggered page content reveal after splash settles
- Logo hover animations (wobble + scale)
- Image lightbox with zoom
- Staggered reveal animations on hero section
- Yarn bounce & gentle float decorative animations
- Responsive mobile-first design
- ARIA-compliant accessible components

      </td>

    </tr>
  </table>

---

## <div align="center">🛠️ Tech Stack</div>

<div align="center">

|     Category     | Technology            | Version  |
| :--------------: | :-------------------- | :------: |
|  **Framework**   | SvelteKit             | ^2.50.2  |
|   **Language**   | Svelte                | ^5.54.0  |
|   **Styling**    | Tailwind CSS          | ^4.1.18  |
|   **Database**   | Supabase (PostgreSQL) | ^2.101.0 |
|     **Auth**     | Supabase SSR          | ^0.10.0  |
|   **Payments**   | Razorpay              |    —     |
|  **Build Tool**  | Vite                  |  ^7.3.1  |
| **Type Checker** | TypeScript            |  ^5.9.3  |
| **E2E Testing**  | Playwright            | ^1.58.2  |
|  **Formatter**   | Prettier              |  ^3.8.1  |
|  **Deployment**  | Vercel                |    —     |

</div>

---

## <div align="center">🗄️ Database Schema</div>

<div align="center">

|          Table           | Description                                                                                       |
| :----------------------: | :------------------------------------------------------------------------------------------------ |
|        `profiles`        | User profiles with admin flag, phone, full name                                                   |
|       `categories`       | Product categories with display order, slug, tagline, image                                       |
|        `products`        | Full product data — price, stock, images, colors, sizes, materials, care instructions, dimensions |
|         `orders`         | Order tracking with auto-generated KL-XXXX order numbers, Razorpay IDs, shipping address          |
|       `discounts`        | Discount codes with type, value, max uses, min order, validity                                    |
|         `carts`          | Persistent shopping carts linked to session/user with JSON items                                  |
|       `wishlists`        | Per-user product wishlists with unique constraint                                                 |
| `newsletter_subscribers` | Email newsletter signups                                                                          |

</div>

---

## <div align="center">🛡️ Security</div>

<div align="center">

|    Feature    | Details                              |
| :-----------: | :----------------------------------- |
|    **RLS**    | Row Level Security on all tables     |
|   **Roles**   | Anon, authenticated, admin           |
| **Functions** | Secure search paths                  |
|  **Storage**  | Public read, admin write policies    |
|   **Auth**    | OTP phone verification, session mgmt |

</div>

---

## <div align="center">🚀 Quick Start</div>

```sh
# Clone the repo
git clone https://github.com/utkarshg1/crochet-website.git
cd crochet-website

# Install dependencies
npm install

# Start development server
npm run dev
```

```sh
# Build for production
npm run build

# Preview production build
npm run preview
```

> See `.env.example` for required Supabase and Razorpay environment variables.

---

## <div align="center">📋 Scripts</div>

<div align="center">

| Command               | Description                               |
| :-------------------- | :---------------------------------------- |
| `npm run dev`         | Start development server                  |
| `npm run build`       | Create production build                   |
| `npm run preview`     | Preview production build locally          |
| `npm run check`       | Run SvelteKit sync + Svelte type checking |
| `npm run check:watch` | Type checking in watch mode               |
| `npm run lint`        | Check formatting with Prettier            |
| `npm run format`      | Auto-format all files with Prettier       |
| `npm run test`        | Run Playwright end-to-end tests           |

</div>

---

## <div align="center">📁 Project Structure</div>

```
src/
├── lib/
│   ├── assets/              # Images, SVGs, favicon
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives (Button, Input, Badge)
│   │   ├── CartDrawer.svelte
│   │   ├── CategoryChip.svelte
│   │   ├── Footer.svelte
│   │   ├── Nav.svelte
│   │   ├── ProductCard.svelte
│   │   └── SplashScreen.svelte
│   ├── logoState.svelte.ts        # Splash animation settlement flag
│   ├── cart.svelte.ts             # Cart store (localStorage)
│   ├── database.types.ts          # Auto-generated Supabase types
│   ├── supabase.ts                # Browser Supabase client
│   └── types.ts                   # Domain types + price utilities
├── routes/
│   ├── +layout.svelte             # Root shell (Nav, Footer, SplashScreen)
│   ├── +page.svelte               # Home page
│   ├── layout.css                 # Global styles + Tailwind theme
│   ├── about/                     # About page
│   ├── account/                   # Account page
│   ├── admin/                     # Admin dashboard
│   │   ├── categories/            # Category management
│   │   ├── login/                 # Admin login
│   │   └── orders/                # Order management
│   ├── auth/                      # Auth callbacks (OTP, admin)
│   ├── cart/                      # Cart page
│   ├── checkout/                  # Checkout + Razorpay
│   ├── faq/                       # FAQ page
│   ├── order/[id]/               # Order tracking
│   ├── shipping/                  # Shipping & returns
│   ├── shop/                      # Product catalog
│   │   └── [slug]/               # Product detail
│   └── wishlist/                  # Wishlist page
└── app.d.ts                       # SvelteKit type declarations
```

---

## <div align="center">🎨 Design System</div>

<div align="center">

| Token                  | Value      | Usage                             |
| :--------------------- | :--------- | :-------------------------------- |
| `--color-primary`      | `#a7295a`  | Rose — CTAs, links, active states |
| `--color-secondary`    | `#00675d`  | Teal — badges, accents            |
| `--color-surface`      | `#dcfdf8`  | Page background                   |
| `--color-surface-card` | `#ffffff`  | Card backgrounds                  |
| `--font-display`       | Newsreader | Headings, display text            |
| `--font-body`          | Manrope    | Body copy, UI text                |

</div>

Custom utilities: `.glass` (glassmorphism), `.mask-organic` (clip-path shapes), `.shadow-ambient` (tonal shadows), `.chip` (organic pill shape).

Keyframe animations: `yarn-bounce`, `gentle-float`, `slide-in-right`, `zoom-in`, `fade-in`, `logo-reveal` (hero logo scale-in after splash).

---

## <div align="center">👩‍🎨 Credits</div>

<div align="center">

**Maker** — [Kalyani Gaikwad](https://krafted-loops-studios.vercel.app/about) · Pune, Maharashtra

**Website by** — Utkarsh Gaikwad

<br />

<sub>Made with 🧶 and a whole lot of love</sub>

</div>
