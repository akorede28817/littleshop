import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Cart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ code: string; type: string; value: number } | null>(null);

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, price, images, stock)")
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

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) {
      toast({ title: "Invalid coupon", variant: "destructive" });
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ title: "Coupon expired", variant: "destructive" });
      return;
    }
    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast({ title: "Coupon usage limit reached", variant: "destructive" });
      return;
    }
    setDiscount({ code: data.code, type: data.discount_type, value: Number(data.discount_value) });
    toast({ title: "Coupon applied!" });
  };

  if (!user) return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">Please sign in to view your cart.</p>
      <Button asChild className="mt-4"><Link to="/auth">Sign In</Link></Button>
    </div>
  );

  const subtotal = cartItems?.reduce((sum, item) => sum + Number(item.products?.price || 0) * item.quantity, 0) || 0;
  const discountAmount = discount
    ? discount.type === "percentage" ? subtotal * (discount.value / 100) : discount.value
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

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
                  <div>
                    <Link to={`/products/${item.products?.id}`} className="font-semibold hover:text-primary">{item.products?.name}</Link>
                    <p className="text-sm text-primary">${Number(item.products?.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 rounded border border-border">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem.mutate(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-right font-semibold">${(Number(item.products?.price || 0) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-6">
            <h2 className="font-display text-xl font-bold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({discount.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
              <Button variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            <Button className="mt-4 w-full" onClick={() => navigate("/checkout", { state: { discount } })}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
