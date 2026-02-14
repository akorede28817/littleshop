import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["wishlist", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*, products(id, name, price, images, compare_at_price)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("wishlist").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const addToCart = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: productId, quantity: 1 },
      { onConflict: "user_id,product_id" }
    );
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Added to cart" });
  };

  if (!user) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Sign in to view your wishlist.</p>
      <Button asChild className="mt-4"><Link to="/auth">Sign In</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
      {isLoading ? <p className="mt-4 text-muted-foreground">Loading...</p> :
       items?.length === 0 ? (
        <div className="mt-8 text-center">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild className="mt-4"><Link to="/products">Browse Products</Link></Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items?.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <Link to={`/products/${item.products?.id}`}>
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img src={item.products?.images?.[0] || "/placeholder.svg"} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
              </Link>
              <CardContent className="p-4">
                <h3 className="font-semibold">{item.products?.name}</h3>
                <p className="text-primary font-bold">${Number(item.products?.price || 0).toFixed(2)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => addToCart(item.products?.id!)}>
                    <ShoppingCart className="mr-1 h-4 w-4" /> Add to Cart
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => remove.mutate(item.id)}>
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
