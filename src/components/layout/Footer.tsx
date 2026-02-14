import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-bold">
              <span className="text-primary">NOIR</span> STORE
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium products with exceptional quality and style.
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
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Support</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>help@noirstore.com</span>
              <span>1-800-NOIR</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Noir Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
