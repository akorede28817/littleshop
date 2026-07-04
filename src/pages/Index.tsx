import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-video.mp4";

export default function Index() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("featured", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: newArrivals, isLoading: loadingNew } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Quality <span className="text-primary">Kampala & Ankara</span> Fabrics
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Sultansammy Stores — Quality Fabrics, Stress-Free Shopping. Shop premium fabrics and quality bags with fast, reliable delivery.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/categories">Browse Categories</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card py-8">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {[
            { icon: Truck, title: "Fast & Reliable Deliveries", desc: "Doorstep delivery, safely and on time" },
            { icon: Shield, title: "Easy Transactions", desc: "Smooth, secure and stress-free" },
            { icon: Star, title: "Quality Fabrics", desc: "Top-notch Kampala, Ankara & more" },
            { icon: RotateCcw, title: "Trusted Service", desc: "Best prices, every time" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 text-sm">
              <Icon className="h-8 w-8 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Shop by Category</h2>
              <p className="text-muted-foreground">Find exactly what you need</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/categories">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {loadingCategories
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
              : categories?.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${cat.id}`}>
                    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="flex h-40 flex-col justify-end p-6">
                        <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked favorites</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products?featured=true">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)
              : featuredProducts?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">New Arrivals</h2>
              <p className="text-muted-foreground">Just dropped this week</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/products?sort=newest">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loadingNew
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)
              : newArrivals?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold">Ready to Elevate Your Style?</h2>
          <p className="mx-auto mt-2 max-w-lg opacity-80">
            Join customers who trust Sultansammy Stores for quality Kampala, Ankara fabrics and bags.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const imageUrl = product.images?.[0] || "/placeholder.svg";

  return (
    <Link to={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{product.categories?.name}</p>
          <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">₦{Number(product.price).toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="text-sm text-muted-foreground line-through">
                ₦{Number(product.compare_at_price).toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
