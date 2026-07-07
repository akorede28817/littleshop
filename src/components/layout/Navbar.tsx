import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/sultansammy-logo.jpg.asset.json";
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartCount } = useQuery({
    queryKey: ["cart-count", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", user!.id);
      if (error) return 0;
      return data.reduce((sum, item) => sum + item.quantity, 0);
    },
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-bold tracking-tight">
          <img src={logo.url} alt="Sultansammy Stores" className="h-10 w-10 rounded-full object-cover" />
          <span className="hidden sm:inline text-lg"><span className="text-primary">Sultansammy</span> <span className="text-foreground">Stores</span></span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/products" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Shop</Link>
          <Link to="/categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Categories</Link>
          <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
        </div>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-0" />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <Link to="/wishlist"><Heart className="h-5 w-5" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {(cartCount ?? 0) > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {cartCount! > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/account")}>My Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account/orders")}>Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>Wishlist</DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")} size="sm">Sign In</Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border p-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary border-0" />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link to="/categories" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
            <Link to="/contact" className="py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
