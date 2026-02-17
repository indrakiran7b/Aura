import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categoryCards = [
  { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400", href: "/shop?category=Electronics" },
  { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400", href: "/shop?category=Fashion" },
  { name: "Home & Living", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400", href: "/shop?category=Home+%26+Living" },
  { name: "Sports", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400", href: "/shop?category=Sports+%26+Outdoors" },
  { name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", href: "/shop?category=Beauty" },
];

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Star, title: "Premium Quality", desc: "Curated products" },
];

export default function Index() {
  const { data: featured, isLoading: featuredLoading } = useProducts({ featured: true, pageSize: 4 });
  const { data: newest, isLoading: newestLoading } = useProducts({ pageSize: 8, sort: "newest" });

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(45_80%_65%/0.15),transparent_50%)]" />
        </div>
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-4">Premium Collection 2026</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Elevate Your
              <br />
              <span className="text-gradient-gold">Lifestyle</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 max-w-md">
              Discover curated luxury products designed for those who appreciate the finer things in life.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" className="gradient-gold text-navy font-semibold hover:opacity-90" asChild>
                <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/shop?category=Electronics">Explore</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features bar */}
      <section className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold">Shop by Category</h2>
            <p className="text-muted-foreground mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden md:block">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryCards.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={cat.href}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden block"
              >
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute bottom-4 left-4 text-white font-display font-semibold text-lg">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Handpicked favorites</p>
            </div>
            <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden md:block">View All →</Link>
          </div>
          {featuredLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured?.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold">New Arrivals</h2>
            <p className="text-muted-foreground mt-1">The latest additions to our collection</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden md:block">View All →</Link>
        </div>
        {newestLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newest?.products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="gradient-hero">
        <div className="container py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Ready to Elevate Your Style?</h2>
          <p className="mt-4 text-white/70 max-w-md mx-auto">Join thousands of satisfied customers who trust LUXE for premium quality.</p>
          <Button size="lg" className="mt-8 gradient-gold text-navy font-semibold hover:opacity-90" asChild>
            <Link to="/shop">Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
