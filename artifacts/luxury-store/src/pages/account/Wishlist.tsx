import { useAccount } from "@/contexts/AccountContext";
import { useGetProduct } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { X } from "lucide-react";
import { Link } from "wouter";

function WishlistItem({ id }: { id: number }) {
  const { data: product, isLoading } = useGetProduct(id);
  const { removeFromWishlist } = useAccount();

  if (isLoading) return <div className="aspect-[3/4] bg-card animate-pulse" />;
  if (!product) return null;

  return (
    <div className="relative group">
      <ProductCard product={product} />
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(id); }}
        className="absolute top-3 left-3 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black"
        title="Remove from wishlist"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist } = useAccount();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display uppercase tracking-widest border-b border-border pb-4">My Wishlist</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border">
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-widest">Your wishlist is empty. Discover pieces you love.</p>
          <Link href="/products" className="px-8 py-3 bg-foreground text-background uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map(id => (
            <WishlistItem key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
