# Krafted Loop Studio – Product Requirements Document (PRD)

**Project Name:** Krafted Loop Studio E-commerce Website  
**Brand:** Krafted Loop Studio by Kalyani Gaikwad  
**Version:** 1.7 (Claude-Ready – Handmade Crochet Only)  
**Date:** 30 March 2026  
**Prepared for:** Claude Code AI Agent (with Supabase MCP Server Access)  
**Owner:** Kalyani Gaikwad  

---

## 1. Executive Summary

Build a beautiful, single-owner e-commerce website that sells **only handmade crochet products** created by Kalyani Gaikwad under the brand **Krafted Loop Studio**.

The website must feel warm, artisanal, and personal — highlighting the handmade nature of every item (yarn texture, craftsmanship, love put into each piece).

**Core Technical Stack:**
- **Frontend:** SvelteKit 2.x with smooth yarn-inspired animations
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
- **Design:** Light theme only (no dark mode – per wife’s preference)
- **User Experience:** Amazon-style guest-first shopping
- **Payments:** Razorpay + UPI (India-only)
- **Admin Panel:** Integrated into the main app under `/admin` (protected)
- **Assets:** Use provided `logo.png` and hero/brand video

**Important Constraint:** This website sells **handmade crochet products only**. No other product categories (e.g., no knitted, no machine-made, no third-party items).

---

## 2. Design & Branding Guidelines

- **Theme:** Light theme only – soft, bright, warm, and airy.
- **Color Palette:**
  - Background: Soft cream `#FAF5EE` or `#FFF8F0`
  - Cards/Sections: Pure white `#FFFFFF`
  - Accents: Sage Green `#A8B5A2`, Blush Pink `#E8B4BC`, Warm Mustard `#E8C39E`, Gentle Coral `#F4A8A8`
  - Text: Deep warm gray `#3F2A1E`, Secondary muted brown-gray `#6B5E52`
- **Visual Style:** Generous whitespace, soft shadows, rounded corners, high-quality lifestyle and close-up photos showing yarn texture and handmade details.
- **Assets Integration:**
  - `logo.png`: Header, footer, favicon, Razorpay branding, admin header
  - Hero Video: Autoplaying on homepage (muted, loop, playsinline, with poster fallback) – preferably showing crochet process or finished handmade pieces
- **Animations:** Gentle yarn-loop, crochet hook, and thread-pull inspired micro-interactions using Svelte transitions. Keep lightweight and performant on mobile.
- **Tone:** Warm, personal, artisanal, “handmade with love by Kalyani Gaikwad”

---

## 3. Product Focus – Handmade Crochet Only

All products on the website must be **handmade crochet items** created by Kalyani Gaikwad. Examples include:
- Amigurumi (stuffed toys, animals, dolls)
- Home décor (coasters, wall hangings, baskets, table runners)
- Accessories (bags, scrunchies, keychains, earrings)
- Baby items (booties, blankets, rattles, hats)
- Wearables (shawls, scarves, cardigans – if handmade crochet)
- Seasonal & festival items (ornaments, gift sets)

**Database & UI Note:**  
- Categories should reflect crochet-specific groupings (e.g., Amigurumi, Home Décor, Baby Collection, Accessories, Seasonal).
- Every product description must emphasize the handmade crochet aspect, materials (cotton yarn, acrylic, etc.), and time invested.
- No support for non-crochet products.

---

## 4. User Experience (Amazon-Style Guest-First)

- Users can browse, search, filter, and add **handmade crochet products** to cart **without any login**.
- **Checkout Flow:**
  1. Cart → Proceed to Checkout
  2. Prominent **“Continue as Guest”** button
  3. Collect: Full Name, Phone Number (+91 format), Email, Shipping Address + Pincode
  4. **Mandatory backend email verification** via Supabase Auth (confirmation email / magic link)
  5. Razorpay payment (UPI preferred)
- Login is optional and only encouraged for repeat purchases and order tracking.
- Guest orders are fully supported.

---

## 5. Functional Requirements

### 5.1 Public Pages (No Auth Required)
- **Homepage**: Hero section with provided video + logo, featured handmade crochet products, category cards (crochet-specific), “Our Story” about Kalyani’s crochet journey.
- **Shop Page**: Responsive grid of handmade crochet items, filters (Category, Price, Color, New, On Sale), search by product name or tags.
- **Product Detail Page (PDP)**: High-quality images showing crochet details, description highlighting handmade process, care instructions, dimensions, materials (yarn type).
- **Cart & Checkout**: Guest-friendly with email verification step.
- Static pages: About Us (Kalyani’s handmade crochet story), Shipping & Returns, Privacy Policy.

### 5.2 Admin Panel (Integrated at `/admin` – Protected)
- Dashboard: Recent orders, low stock handmade items, total sales
- **Products Management**: Full CRUD for handmade crochet products
  - Fields: Title, slug, description (rich text emphasizing handmade), price (INR/paise), stock, category, multiple images (Supabase Storage), colors, dimensions, materials, care instructions, tags, is_featured, is_new
- Discounts / Coupons management
- Orders management (update status, tracking ID)
- Basic settings

**Admin Access:** Only Kalyani via `is_admin = true` flag + RLS.

---

## 6. Technical Stack

- **Frontend:** SvelteKit 2.x + Tailwind CSS (mobile-first, light theme only)
- **Backend:** Supabase (full suite)
- **Payments:** Razorpay Checkout + Webhook (Edge Function)
- **Auth:** Supabase Auth with mandatory email verification
- **Storage:** Supabase Storage for all product images

---

## 7. Supabase Database Schema (Execute in Supabase SQL Editor)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (Crochet-specific)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,        -- e.g., Amigurumi, Home Décor, Baby Collection
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (Handmade Crochet Only)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,                    -- Must mention handmade crochet
  price INTEGER NOT NULL,              -- in paise (₹1299 = 129900)
  compare_at_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB[],                      -- [{url, alt, order}]
  colors TEXT[],
  dimensions TEXT,
  materials TEXT,                      -- e.g., "100% Cotton Yarn, Hand-crocheted"
  care_instructions TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  tags TEXT[],                         -- e.g., ["handmade", "amigurumi", "gift"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts, Discounts, Orders (same as previous version – supports guest checkout)
CREATE TABLE public.carts (...);           -- Use previous schema definition
CREATE TABLE public.discounts (...);
CREATE TABLE public.orders (...);          -- Supports guest_email, guest_name, guest_phone

**Important Notes for Claude:**
- Enable Email Confirmations in Supabase Auth.
- Create Storage bucket: `product-images` (public).
- Set `is_admin = true` for Kalyani’s user email.
- All products added via admin must be handmade crochet items.

---

## 8. Payment Integration

- Razorpay Standard Checkout with UPI as highlighted option.
- Server-side order creation and signature verification.
- Webhook handling via Supabase Edge Function.
- Prefill customer details from checkout form.

---

## 9. Non-Functional Requirements

- Fully responsive & mobile-first (Tailwind)
- Light theme only (no `dark:` classes)
- High performance on 3G/4G networks common in India
- SEO-friendly SSR
- All content and descriptions must reflect “handmade crochet”

---

## 10. Deliverables Expected

Please build the complete SvelteKit + Supabase project with:

1. Correct Supabase schema (with crochet focus in comments/categories)
2. Light theme Tailwind configuration
3. Homepage featuring hero video + logo + handmade crochet products
4. Full shop and PDP optimized for showcasing crochet texture/details
5. Guest checkout + mandatory email verification
6. Protected admin panel for managing handmade crochet products
7. Razorpay UPI integration
8. Beautiful, subtle yarn/crochet-inspired animations

**Start by executing the Supabase schema**, then proceed with SvelteKit development.
