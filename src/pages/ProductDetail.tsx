import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/products/ProductCard";
import { Heart, Minus, Plus, ShoppingBag, Star, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || "");
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: related } = useProducts({
    category: product?.category,
    pageSize: 4,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button className="mt-4" asChild><Link to="/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const specs = (product.specs as Record<string, string>) || {};
  const relatedProducts = related?.products.filter((p) => p.id !== product.id).slice(0, 4) || [];

  return (
    <div className="container py-8">
      <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <h1 className="text-3xl font-display font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-accent text-accent" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.review_count} reviews)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.original_price!.toFixed(2)}</span>
                <span className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                  Save ${(product.original_price! - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div className="border border-border rounded-lg divide-y divide-border">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>
              {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
            </span>
          </div>

          {/* Add to cart */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-md">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product, quantity);
                toast.success(`Added ${quantity} item${quantity > 1 ? "s" : ""} to bag!`);
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" /> Add to Bag
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => {
                toggleWishlist(product.id);
                toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
              }}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-destructive text-destructive" : ""}`} />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
