import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";

export default function Home() {
  const { data: featuredResponse, isLoading } = useListProducts({ featured: true, limit: 4 });
  const featuredProducts = featuredResponse?.products || [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Luxury Fashion Editorial" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 flex flex-col items-center">
          <h2 className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary mb-6">
            The Autumn / Winter Collection
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-8 leading-tight">
            ELEVATE <br /> YOUR ESSENCE
          </h1>
          <Link href="/products">
            <button className="px-10 py-4 bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest text-sm">
              Discover the Collection
            </button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl font-display uppercase tracking-widest mb-4">Curated Selections</h2>
          <div className="w-12 h-px bg-primary" />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <Link href="/products?featured=true" className="inline-block border-b border-foreground pb-1 text-sm uppercase tracking-widest hover:text-primary hover:border-primary transition-colors">
            View All Featured
          </Link>
        </div>
      </section>

      {/* Lookbook / Categories */}
      <section className="py-12 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <Link href="/products?category=women" className="group relative aspect-[4/5] md:aspect-auto md:h-[80vh] overflow-hidden">
            <img 
              src={`${import.meta.env.BASE_URL}images/lookbook-1.png`}
              alt="Women's Collection" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-4xl font-display mb-4">WOMEN</h3>
              <span className="text-sm tracking-widest uppercase border-b border-transparent group-hover:border-white pb-1 transition-all">
                Shop Collection
              </span>
            </div>
          </Link>
          <Link href="/products?category=men" className="group relative aspect-[4/5] md:aspect-auto md:h-[80vh] overflow-hidden">
            <img 
              src={`${import.meta.env.BASE_URL}images/lookbook-2.png`}
              alt="Men's Collection" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-4xl font-display mb-4">MEN</h3>
              <span className="text-sm tracking-widest uppercase border-b border-transparent group-hover:border-white pb-1 transition-all">
                Shop Collection
              </span>
            </div>
          </Link>
        </div>
      </section>
      
      {/* Brand Ethos */}
      <section className="py-32 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-display text-3xl mb-8 leading-relaxed">
          "True luxury is a state of mind. It is an expression of deep appreciation for artistry, detail, and the profound beauty found in simplicity."
        </h2>
        <p className="text-muted-foreground uppercase tracking-widest text-sm">— The Atelier</p>
      </section>
    </div>
  );
}
