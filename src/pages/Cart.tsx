import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, images, stock)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await supabase.from("cart_items").delete().eq("id", id);
      } else {
        await supabase.from("cart_items").update({ quantity }).eq("id", id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("cart_items").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  if (!user) return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">Please sign in to view your cart.</p>
      <Button asChild className="mt-4"><Link to="/auth">Sign In</Link></Button>
    </div>
  );

  const waMessage = encodeURIComponent(
    "Hello Sultansammy Stores, I'd like to order the following items:\n\n" +
    (cartItems?.map((i) => `• ${i.products?.name} x${i.quantity}`).join("\n") || "")
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Shopping Cart</h1>

      {isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading...</p>
      ) : cartItems?.length === 0 ? (
        <div className="mt-8 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4"><Link to="/products">Continue Shopping</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-border p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img src={item.products?.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <Link to={`/products/${item.products?.id}`} className="font-semibold hover:text-primary">{item.products?.name}</Link>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded border border-border">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-6">
            <h2 className="font-display text-xl font-bold">Ready to Order?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Contact us to confirm pricing and place your order. We'll walk you through payment and delivery.
            </p>
            <div className="mt-4 space-y-2">
              <Button asChild className="w-full">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

