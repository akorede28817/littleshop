import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function Orders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, images))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  if (!orders?.length) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                <p className="mt-1 font-bold text-primary">${Number(order.total).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-secondary">
                    <img src={item.products?.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <span className="flex-1">{item.product_name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                  <span>${Number(item.price_at_purchase).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
