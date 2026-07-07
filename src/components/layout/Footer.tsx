import { Link } from "react-router-dom";
import logo from "@/assets/sultansammy-logo.jpg.asset.json";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={logo.url} alt="Sultansammy Stores" className="h-10 w-10 rounded-full object-cover" />
              <h3 className="font-display text-lg font-bold">
                <span className="text-primary">Sultansammy</span> Stores
              </h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Quality Fabrics, Stress-Free Shopping. Premium Kampala & Ankara fabrics and quality bags.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Shop</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/products" className="hover:text-foreground">All Products</Link>
              <Link to="/categories" className="hover:text-foreground">Categories</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Account</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/account" className="hover:text-foreground">My Account</Link>
              <Link to="/account/orders" className="hover:text-foreground">Orders</Link>
              <Link to="/wishlist" className="hover:text-foreground">Wishlist</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Contact Us</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="tel:08027853427" className="hover:text-foreground">Call: 08027853427</a>
              <a href="https://wa.me/2348027853427" target="_blank" rel="noreferrer" className="hover:text-foreground">WhatsApp Chat</a>
              <Link to="/contact" className="hover:text-foreground">Contact Page</Link>
              <span>Fast & reliable deliveries nationwide.</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sultansammy Stores. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
