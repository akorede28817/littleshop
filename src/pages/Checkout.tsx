import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigate, Link } from "react-router-dom";
import { MessageCircle, Phone, ShoppingBag } from "lucide-react";

export default function Checkout() {
  const { user, loading } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, images)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const waMessage = encodeURIComponent(
    "Hello Sultansammy Stores, I'd like to place an order for:\n\n" +
    (cartItems?.map((i) => `• ${i.products?.name} x${i.quantity}`).join("\n") || "")
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Your Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cartItems?.length ? cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="h-14 w-14 overflow-hidden rounded bg-secondary">
                    <img src={item.products?.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.products?.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm">Your cart is empty.</p>
                  <Button asChild variant="outline" size="sm" className="mt-3"><Link to="/products">Browse Products</Link></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Contact Us to Order</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reach out to confirm your order, pricing, and delivery details. Our team responds quickly and will guide you through payment.
              </p>
              <Button asChild className="w-full" disabled={!cartItems?.length}>
                <a href={`https://wa.me/2348027853427?text=${waMessage}`} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> Order via WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="tel:08027853427"><Phone className="mr-2 h-4 w-4" /> Call 08027853427</a>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/contact">More Contact Options</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
