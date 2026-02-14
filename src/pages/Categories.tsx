import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Categories</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
          : categories?.length === 0
          ? <p className="text-muted-foreground col-span-full text-center py-12">No categories yet.</p>
          : categories?.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`}>
                <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  {cat.image_url && (
                    <div className="h-32 overflow-hidden">
                      <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.description && <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
