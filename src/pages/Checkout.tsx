import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";

const PAYSTACK_PUBLIC_KEY = "pk_test_a1de9060440ba88a03285c9ebc6ca02761e8c1c0";

// Load Paystack inline script
function usePaystackScript() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (document.getElementById("paystack-script")) { setLoaded(true); return; }
    const s = document.createElement("script");
    s.id = "paystack-script";
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onload = () => setLoaded(true);
    document.head.appendChild(s);
  }, []);
  return loaded;
}

export default function Checkout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const discount = (location.state as any)?.discount;
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const paystackReady = usePaystackScript();

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const { data: cartItems } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(id, name, price, images)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const subtotal = cartItems?.reduce((sum, item) => sum + Number(item.products?.price || 0) * item.quantity, 0) || 0;
  const discountAmount = discount
    ? discount.type === "percentage" ? subtotal * (discount.value / 100) : discount.value
    : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartItems?.length || !paystackReady) return;
    setPlacing(true);

    // 1. Create order with unpaid status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_zip: shipping.zip,
        shipping_country: shipping.country,
        coupon_code: discount?.code || null,
        discount_amount: discountAmount,
        payment_status: "unpaid",
      })
      .select()
      .single();

    if (orderError) {
      toast({ title: "Error", description: orderError.message, variant: "destructive" });
      setPlacing(false);
      return;
    }

    // 2. Insert order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.products?.id,
      product_name: item.products?.name || "",
      quantity: item.quantity,
      price_at_purchase: Number(item.products?.price || 0),
    }));
    await supabase.from("order_items").insert(orderItems);

    // 3. Open Paystack popup (amount in kobo)
    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: Math.round(total * 100),
      currency: "NGN",
      ref: `order_${order.id}_${Date.now()}`,
      metadata: { order_id: order.id },
      callback: async (response: any) => {
        // 4. Verify payment server-side
        try {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-paystack", {
            body: { reference: response.reference, order_id: order.id },
          });

          if (verifyError || !verifyData?.success) {
            toast({ title: "Verification failed", description: "Payment could not be verified. Contact support.", variant: "destructive" });
            setPlacing(false);
            return;
          }

          // 5. Clear cart & show success
          await supabase.from("cart_items").delete().eq("user_id", user.id);
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          setOrderPlaced(true);
        } catch {
          toast({ title: "Error", description: "Payment verification failed.", variant: "destructive" });
        }
        setPlacing(false);
      },
      onClose: () => {
        toast({ title: "Payment cancelled", description: "You can retry anytime from your orders." });
        setPlacing(false);
      },
    });
    handler.openIframe();
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto flex flex-col items-center px-4 py-20 text-center">
        <CheckCircle className="h-20 w-20 text-green-400" />
        <h1 className="mt-4 font-display text-3xl font-bold">Order Placed!</h1>
        <p className="mt-2 text-muted-foreground">Payment received. Thank you for your purchase!</p>
        <div className="mt-6 flex gap-4">
          <Button asChild><a href="/account/orders">View Orders</a></Button>
          <Button variant="outline" asChild><a href="/products">Continue Shopping</a></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label>Full Name</Label><Input required value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Address</Label><Input required value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} /></div>
              <div className="space-y-2"><Label>City</Label><Input required value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>State</Label><Input required value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} /></div>
              <div className="space-y-2"><Label>ZIP</Label><Input required value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} /></div>
              <div className="space-y-2"><Label>Country</Label><Input required value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} /></div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {cartItems?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.products?.name} x{item.quantity}</span>
                  <span>₦{(Number(item.products?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₦{subtotal.toFixed(2)}</span></div>
                {discount && <div className="flex justify-between text-sm text-green-400"><span>Discount</span><span>-₦{discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span className="text-primary">₦{total.toFixed(2)}</span></div>
              </div>
              <Button type="submit" className="w-full" disabled={placing || !cartItems?.length || !paystackReady}>
                {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : "Pay with Paystack"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
