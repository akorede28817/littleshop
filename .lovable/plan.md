
# Mini E-Commerce Website — Dark Theme, Physical Goods

## Overview
A full-featured mini e-commerce platform with a sleek dark theme, Stripe payment integration, and a full admin panel for managing products, orders, users, and coupons.

---

## 1. Database Setup (Lovable Cloud / Supabase)

We'll create the following tables with proper relationships and RLS policies:

- **Profiles** — user info (name, avatar, address, phone) linked to auth.users
- **User Roles** — separate roles table (admin, user) for secure role-based access
- **Categories** — product categories (name, description, image)
- **Products** — name, description, price, images, stock, category, featured flag
- **Cart** — user's cart items (product, quantity)
- **Orders** — order status, total, shipping address, payment status
- **Order Items** — individual items per order (product, quantity, price at purchase)
- **Reviews** — product ratings & text reviews by authenticated users
- **Coupons** — discount codes with expiry dates, usage limits, percentage/fixed amounts
- **Wishlist** — saved products per user

---

## 2. Customer-Facing Storefront (Dark Theme)

### Homepage
- Hero banner with featured products
- Category showcase grid
- Trending / new arrivals section
- Newsletter or promotional banner

### Product Browsing
- Category pages with filtering (price range, rating) and sorting
- Search bar with product suggestions
- Product detail page with image gallery, description, reviews, and "Add to Cart" / "Add to Wishlist" buttons

### Shopping Cart
- Add/remove items, update quantities
- Apply coupon codes for discounts
- Cart summary with subtotal and discount breakdown

### Checkout & Payments (Stripe)
- Shipping address form
- Order summary review
- Stripe payment integration for secure checkout
- Order confirmation page

### User Account
- Sign up / login (email & password)
- Profile management (name, address, phone)
- Order history with status tracking
- Wishlist management
- My reviews

---

## 3. Admin Dashboard

Accessible only to users with the "admin" role, with a separate admin layout.

### Dashboard Home
- Overview stats: total orders, revenue, users, products count
- Recent orders list

### Product Management
- CRUD for products (name, price, description, images, stock, category)
- Manage categories (add/edit/delete)

### Order Management
- View all orders with status filters
- Update order status (pending → processing → shipped → delivered)
- View order details and items

### User Management
- View registered users
- Assign/remove admin roles

### Coupon Management
- Create/edit/delete discount coupons
- Set discount type (percentage or fixed), expiry, and usage limits

### Review Moderation
- View all product reviews
- Delete inappropriate reviews

---

## 4. Design & UX

- **Dark theme** throughout with sleek, modern styling
- Responsive design for mobile, tablet, and desktop
- Smooth transitions and loading states
- Toast notifications for user actions (added to cart, order placed, etc.)
- Clean navigation with category menu and user account dropdown
