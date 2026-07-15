<div align="center">

<img src="https://raw.githubusercontent.com/utkarshg1/crochet-website/main/src/lib/assets/Krafted%20Loops%20Circle%20Sticker.png" alt="Krafted Loops Studio Logo" width="240" />

# Krafted Loops Studio

**Handmade crochet e-commerce website — where every stitch tells a story.**

🌐 <a href="https://krafted-loops-studios.vercel.app/"><strong>krafted-loops-studios.vercel.app</strong></a>
&nbsp;&nbsp;·&nbsp;&nbsp;
📸 <a href="https://www.instagram.com/krafted_loops_studio"><strong>@krafted_loops_studio</strong></a>

<br />

![SvelteKit](https://img.shields.io/badge/SvelteKit-2-blue?style=flat-square&logo=svelte&logoColor=white&color=a7295a)
![Svelte](https://img.shields.io/badge/Svelte-5.54-ff3e00?style=flat-square&logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-072653?style=flat-square&logo=razorpay&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## <div align="center">✨ Features</div>

<table>
  <tr>
    <td width="50%">

### 🛍️ Storefront

- Product catalog with category filtering, search & sort
- Image gallery with color variants & size selection
- Persistent shopping cart
- Wishlist with heart toggle
- Razorpay checkout flow
- Order tracking

    </td>
    <td width="50%">

### 🛠️ Admin Dashboard

- Product CRUD with image uploads
- Category management
- Order management with status updates
- Inventory tracking

    </td>
  </tr>
  <tr>
    <td>

### 📄 Pages

- **Home** — Hero, collections, featured products, newsletter
- **Shop** — Full catalog with sidebar filters & mobile drawer
- **About** — Owner story & Instagram QR code
- **FAQ** — Accordion-style common questions
- **Shipping & Returns** — Policies & delivery estimates
- **Cart / Checkout / Account**

    </td>
    <td>

### 🎨 Design & UX

- Custom brand palette (teal surfaces, rose primary)
- Organic mask shapes & ambient tonal shadows
- Glassmorphic navigation bar
- Logo hover animations (wobble + scale)
- Lightbox zoom on product images
- Responsive mobile-first design
- ARIA-compliant accessible components

    </td>
  </tr>
</table>

---

## <div align="center">🗄️ Database Schema</div>

<div align="center">

| Table | Description |
|:-----:|:------------|
| `profiles` | User profiles with admin flag |
| `categories` | Product categories with display order |
| `products` | Full product data (price, stock, images, colors, sizes) |
| `orders` | Order tracking with auto-generated order numbers (KL-XXXX) |
| `discounts` | Discount codes |
| `carts` | Persistent shopping carts |
| `wishlists` | Per-user product wishlists with unique constraint |
| `newsletter_subscribers` | Email newsletter signups |

</div>

---

## <div align="center">🛡️ Security</div>

<div align="center">

| Feature | Details |
|:-------:|:--------|
| **RLS** | Row Level Security on all tables |
| **Roles** | Anon, authenticated, admin |
| **Functions** | Secure search paths |
| **Storage** | Public read, admin write policies |

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

## <div align="center">👩‍🎨 Credits</div>

<div align="center">

**Maker** — [Kalyani Gaikwad](https://krafted-loops-studios.vercel.app/about) · Pune, Maharashtra

**Website by** — Utkarsh Gaikwad

<br />

<sub>Made with 🧶 and a whole lot of love</sub>

</div>
