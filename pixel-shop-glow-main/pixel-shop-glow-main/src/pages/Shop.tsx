import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts, useCategories } from "@/hooks/useProducts";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [minRating, setMinRating] = useState(0);
  const [localSearch, setLocalSearch] = useState(search);

  const { data: categories } = useCategories();
  const { data, isLoading } = useProducts({
    category: category || undefined,
    search: search || undefined,
    sort,
    page,
    pageSize: 12,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1500 ? priceRange[1] : undefined,
    minRating: minRating > 0 ? minRating : undefined,
  });

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", localSearch);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange([0, 1500]);
    setMinRating(0);
    setLocalSearch("");
  };

  const hasFilters = category || search || priceRange[0] > 0 || priceRange[1] < 1500 || minRating > 0;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold">{category || "All Products"}</h1>
        <p className="text-muted-foreground mt-1">
          {data ? `${data.total} product${data.total !== 1 ? "s" : ""} found` : "Loading..."}
        </p>
      </div>

      {/* Search & Sort bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="rating">Best Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="md:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-56 shrink-0 space-y-6`}>
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Category</h3>
            <div className="space-y-1">
              <button
                className={`block text-sm w-full text-left py-1 px-2 rounded transition-colors ${!category ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                onClick={() => updateParam("category", "")}
              >
                All
              </button>
              {categories?.map((c) => (
                <button
                  key={c}
                  className={`block text-sm w-full text-left py-1 px-2 rounded transition-colors ${category === c ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  onClick={() => updateParam("category", c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Price Range</h3>
            <Slider
              min={0}
              max={1500}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Minimum Rating</h3>
            <div className="space-y-1">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  className={`block text-sm w-full text-left py-1 px-2 rounded transition-colors ${minRating === r ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  onClick={() => setMinRating(r)}
                >
                  {r === 0 ? "Any" : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear Filters
            </Button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No products found</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant={page === i + 1 ? "default" : "outline"}
                      onClick={() => updateParam("page", String(i + 1))}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
