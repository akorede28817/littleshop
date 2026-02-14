import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Star, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/coupons", label: "Coupons", icon: Tag },
  { path: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <span className="font-display text-lg font-bold text-primary">NOIR</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Icon className="mr-2 h-4 w-4" /> {label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 border-t border-border p-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Store
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border px-6 md:hidden">
          <span className="font-display font-bold text-primary">NOIR Admin</span>
          <Link to="/"><Button variant="ghost" size="sm">Store</Button></Link>
        </header>
        {/* Mobile nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button variant={location.pathname === path ? "secondary" : "ghost"} size="sm">
                <Icon className="mr-1 h-3 w-3" /> {label}
              </Button>
            </Link>
          ))}
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
