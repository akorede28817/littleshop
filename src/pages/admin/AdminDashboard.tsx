import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, users, revenue] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const totalRevenue = revenue.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      return {
        products: products.count || 0,
        orders: orders.count || 0,
        users: users.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles:user_id(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    { label: "Products", value: stats?.products ?? 0, icon: Package, color: "text-blue-400" },
    { label: "Orders", value: stats?.orders ?? 0, icon: ShoppingBag, color: "text-green-400" },
    { label: "Users", value: stats?.users ?? 0, icon: Users, color: "text-purple-400" },
    { label: "Revenue", value: `₦${(stats?.revenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {recentOrders?.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{(order as any).profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{order.status}</Badge>
                    <p className="mt-1 text-sm font-bold text-primary">${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
