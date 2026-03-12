import { Link } from "wouter";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-card mb-4">
        {/* If image missing, show a fallback solid color */}
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full transform group-hover:scale-[1.08] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white border border-white px-6 py-2 text-xs uppercase tracking-widest bg-black/40 backdrop-blur-sm">
            Quick View
          </span>
        </div>
        
        {/* Wishlist Heart */}
        <button 
          className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors z-10 p-2"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="w-5 h-5" />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.featured && (
            <span className="bg-background/90 text-foreground text-[10px] uppercase tracking-wider py-1 px-2">
              New
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider py-1 px-2">
              Sale
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-start text-left space-y-1">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.brand}
        </span>
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {product.rating !== undefined && (
          <div className="flex items-center text-xs mt-1">
            <span className="text-primary tracking-widest mr-1">
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span className="text-muted-foreground">({product.reviewsCount || 0})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className={`text-sm font-medium ${product.originalPrice && product.originalPrice > product.price ? 'text-primary' : 'text-foreground'}`}>
            {formatPrice(product.price)}
          </span>
        </div>
        
        {product.stockCount !== undefined && product.stockCount <= 3 && product.inStock && (
          <p className="text-amber-500 text-xs mt-1">
            Only {product.stockCount} left
          </p>
        )}
      </div>
    </Link>
  );
}
