import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Heart, Star, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("product_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        user_id: user!.id,
        product_id: id!,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addToCart = async () => {
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("cart_items").upsert(
      { user_id: user.id, product_id: id!, quantity },
      { onConflict: "user_id,product_id" }
    );
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast({
        title: "🛒 Added to cart!",
        description: `${quantity} × ${product?.name} added to your cart.`,
      });
    }
  };

  const addToWishlist = async () => {
    if (!user) { navigate("/auth"); return; }
    const { error } = await supabase.from("wishlist").upsert(
      { user_id: user.id, product_id: id! },
      { onConflict: "user_id,product_id" }
    );
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "❤️ Added to wishlist" });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center text-muted-foreground">Product not found.</div>;

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const userAlreadyReviewed = reviews?.some((r) => r.user_id === user?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-secondary">
            <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-border"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-muted-foreground">{product.categories?.name}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{product.name}</h1>

          {avgRating && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{avgRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviews?.length} reviews)</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <div className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-400">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-destructive">Out of stock</span>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border border-border">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button onClick={addToCart} className="flex-1" disabled={product.stock === 0}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button variant="outline" size="icon" onClick={addToWishlist}>
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Customer Reviews</h2>

        {/* Review Form */}
        {user && !userAlreadyReviewed && (
          <div className="mt-6 rounded-lg border border-border p-6">
            <h3 className="font-semibold">Write a Review</h3>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewRating(i + 1)} className="p-0.5">
                  <Star className={`h-6 w-6 transition-colors ${i < reviewRating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary/50"}`} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your thoughts about this product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mt-3"
              rows={3}
            />
            <Button onClick={() => submitReview.mutate()} disabled={submitReview.isPending} className="mt-3">
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        {reviews?.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="mt-6 space-y-4">
            {reviews?.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  {(review as any).profiles?.avatar_url && (
                    <img src={(review as any).profiles.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    ))}</div>
                    <span className="text-sm font-medium">{(review as any).profiles?.full_name || "Anonymous"}</span>
                  </div>
                </div>
                {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
