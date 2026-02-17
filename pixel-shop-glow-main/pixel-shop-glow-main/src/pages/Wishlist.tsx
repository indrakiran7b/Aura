import { Link } from "react-router-dom";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  const { data: products, isLoading } = useQuery({
    queryKey: ["wishlist-products", wishlist],
    queryFn: async () => {
      if (wishlist.length === 0) return [];
      const { data, error } = await supabase.from("products").select("*").in("id", wishlist);
      if (error) throw error;
      return data;
    },
  });

  if (wishlist.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-display font-bold mt-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mt-2">Save products you love for later.</p>
        <Button className="mt-6" asChild><Link to="/shop">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-display font-bold mb-8">My Wishlist ({wishlist.length})</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products?.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
