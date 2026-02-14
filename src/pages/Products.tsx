import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Products() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || "";
  const [sort, setSort] = useState("newest");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchQuery, categoryId, sort],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)");
      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
      if (categoryId) query = query.eq("category_id", categoryId);
      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "price-asc") query = query.order("price", { ascending: true });
      else if (sort === "price-desc") query = query.order("price", { ascending: false });
      else if (sort === "name") query = query.order("name");
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">
          {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
        </h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link to="/products">
            <span className={`rounded-full px-4 py-1.5 text-sm transition-colors ${!categoryId ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
              All
            </span>
          </Link>
          {categories?.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`}>
              <span className={`rounded-full px-4 py-1.5 text-sm transition-colors ${categoryId === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
        </div>
      ) : products?.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products?.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
                  <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                    {product.compare_at_price && (
                      <span className="text-sm text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
