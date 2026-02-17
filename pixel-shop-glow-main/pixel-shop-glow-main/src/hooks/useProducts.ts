import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  featured?: boolean;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { page = 1, pageSize = 12, sort = "newest" } = filters;

      let query = supabase.from("products").select("*", { count: "exact" });

      if (filters.category) query = query.eq("category", filters.category);
      if (filters.featured) query = query.eq("featured", true);
      if (filters.search) query = query.ilike("name", `%${filters.search}%`);
      if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
      if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
      if (filters.minRating !== undefined) query = query.gte("rating", filters.minRating);

      switch (sort) {
        case "price-asc": query = query.order("price", { ascending: true }); break;
        case "price-desc": query = query.order("price", { ascending: false }); break;
        case "rating": query = query.order("rating", { ascending: false }); break;
        default: query = query.order("created_at", { ascending: false }); break;
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data || [], total: count || 0, totalPages: Math.ceil((count || 0) / pageSize) };
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("category");
      if (error) throw error;
      const unique = [...new Set(data.map((p) => p.category))];
      return unique.sort();
    },
  });
}
