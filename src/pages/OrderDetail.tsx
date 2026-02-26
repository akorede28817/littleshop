import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: typeof Package; label: string }> = {
  pending: { color: "bg-yellow-500/20 text-yellow-400", icon: Clock, label: "Pending" },
  processing: { color: "bg-blue-500/20 text-blue-400", icon: Package, label: "Processing" },
  shipped: { color: "bg-purple-500/20 text-purple-400", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-500/20 text-red-400", icon: XCircle, label: "Cancelled" },
};

const steps = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, images))")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) return <div className="py-20 text-center text-muted-foreground">Order not found.</div>;

  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/account/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
        <Badge className={config.color}>
          <StatusIcon className="mr-1 h-3 w-3" /> {config.label}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const stepConfig = statusConfig[step];
              const StepIcon = stepConfig.icon;
              const isActive = i <= currentStepIndex;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className={`mt-2 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {stepConfig.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`mx-2 h-0.5 flex-1 transition-colors ${i < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <img src={item.products?.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-primary">₦{Number(item.price_at_purchase).toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary & Shipping */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{(Number(order.total) + Number(order.discount_amount || 0)).toFixed(2)}</span></div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-400"><span>Discount</span><span>-₦{Number(order.discount_amount).toFixed(2)}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="text-primary">₦{Number(order.total).toFixed(2)}</span></div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                  {order.payment_status || "unpaid"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {order.shipping_name && (
            <Card>
              <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                <p>{order.shipping_country}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
