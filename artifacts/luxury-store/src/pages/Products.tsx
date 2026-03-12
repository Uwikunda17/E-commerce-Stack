import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Filter, ChevronDown } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";

export default function Products() {
  const [location] = useLocation();
  
  // Parse query params from URL
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category") || "";
  const initialFeatured = searchParams.get("featured") === "true";
  
  const [category, setCategory] = useState(initialCategory);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Sync state if URL changes directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCategory(params.get("category") || "");
  }, [location]);

  const { data: categoriesData } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({
    category: category || undefined,
    featured: initialFeatured ? true : undefined,
    limit: 50
  });

  const products = productsData?.products || [];

  return (
    <div className="pt-24 min-h-screen">
      {/* Page Header */}
      <div className="bg-card py-16 border-b border-border text-center">
        <h1 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">
          {initialFeatured ? "New Arrivals" : category ? category : "All Collections"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto px-4">
          Discover our meticulously crafted pieces designed to elevate your everyday wardrobe.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center pb-4 border-b border-border">
          <span className="text-sm uppercase tracking-widest">{products.length} Results</span>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 text-sm uppercase tracking-widest"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`${isFiltersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="space-y-10 sticky top-32">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest border-b border-border pb-3 mb-4 flex justify-between">
                Categories
              </h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => setCategory("")}
                    className={`text-sm hover:text-primary transition-colors ${!category ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                  >
                    All Collections
                  </button>
                </li>
                {categoriesData?.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setCategory(cat.slug)}
                      className={`text-sm hover:text-primary transition-colors ${category === cat.slug ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Placeholder for more filters (sizes, colors, price) - logic would expand here */}
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest border-b border-border pb-3 mb-4 flex justify-between">
                Refine <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="text-xs text-muted-foreground p-4 bg-card rounded">
                Additional filters (Size, Color, Price) would appear here in a full implementation.
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center pb-8">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">{products.length} Results</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Sort by:</span>
              <select className="bg-transparent border-b border-border text-sm pb-1 outline-none focus:border-primary">
                <option value="newest" className="bg-background">Newest</option>
                <option value="price-asc" className="bg-background">Price: Low to High</option>
                <option value="price-desc" className="bg-background">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-card aspect-[3/4] mb-4"></div>
                  <div className="h-4 bg-card w-1/3 mb-2 mx-auto"></div>
                  <div className="h-4 bg-card w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-card/30 rounded-lg">
              <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
              <button 
                onClick={() => setCategory("")}
                className="mt-6 border-b border-foreground pb-1 text-sm uppercase tracking-widest hover:text-primary hover:border-primary transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
