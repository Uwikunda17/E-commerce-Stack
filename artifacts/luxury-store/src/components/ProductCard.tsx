import { Link } from "wouter";
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
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
      
      <div className="flex flex-col items-center text-center space-y-1">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.brand}
        </span>
        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="text-sm text-foreground">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
