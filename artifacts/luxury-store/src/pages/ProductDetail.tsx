import { useState } from "react";
import { useParams } from "wouter";
import { ChevronRight, Heart, Share2, Plus, Minus } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useGetProduct, useAddToCart } from "@workspace/api-client-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = useCartSession();
  
  const { data: product, isLoading, isError } = useGetProduct(Number(id));
  
  const addToCart = useAddToCart({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        toast({
          title: "Added to Bag",
          description: `${product?.name} has been added to your shopping bag.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Could not add item to bag. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const [emblaRef] = useEmblaCarousel({ loop: true });
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "shipping">("details");

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-display mb-4">Product Not Found</h2>
        <p className="text-muted-foreground">The item you are looking for does not exist or is unavailable.</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!sessionId) return;
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }

    addToCart.mutate({
      data: {
        sessionId,
        productId: product.id,
        quantity,
        size: selectedSize || product.sizes?.[0] || "One Size",
        color: selectedColor || product.colors?.[0] || "Standard"
      }
    });
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground uppercase tracking-widest mb-8">
        <span>Home</span>
        <ChevronRight className="w-3 h-3" />
        <span>{product.categoryName}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images Carousel */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden bg-card aspect-[3/4]" ref={emblaRef}>
            <div className="flex h-full">
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0">
                    <img 
                      src={img} 
                      alt={`${product.name} - View ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex-[0_0_100%] flex items-center justify-center bg-muted text-muted-foreground">
                  No images available
                </div>
              )}
            </div>
          </div>
          {/* Thumbnails (Static representation) */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {product.images?.map((img, idx) => (
              <button key={idx} className="w-20 aspect-[3/4] shrink-0 border border-transparent hover:border-primary transition-colors">
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-4">
          <h2 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">{product.brand}</h2>
          <h1 className="text-3xl lg:text-4xl font-display mb-4">{product.name}</h1>
          <div className="text-xl mb-8 flex items-center gap-4">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted-foreground line-through text-lg">{formatPrice(product.originalPrice)}</span>
            )}
            <span>{formatPrice(product.price)}</span>
          </div>

          <div className="space-y-8 mb-10">
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium uppercase tracking-widest">Color</span>
                  <span className="text-sm text-muted-foreground">{selectedColor || "Select Color"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        selectedColor === c 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium uppercase tracking-widest">Size</span>
                  <button className="text-xs uppercase tracking-widest text-muted-foreground border-b border-muted-foreground pb-0.5 hover:text-primary transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-14 h-14 flex items-center justify-center text-sm border transition-all ${
                        selectedSize === s 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-border text-foreground hover:border-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <span className="text-sm font-medium uppercase tracking-widest block mb-3">Quantity</span>
              <div className="flex items-center w-32 border border-border">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 p-3 text-muted-foreground hover:text-foreground transition-colors flex justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 p-3 text-muted-foreground hover:text-foreground transition-colors flex justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-12">
            <button 
              onClick={handleAddToCart}
              disabled={addToCart.isPending || (!product.inStock)}
              className="flex-1 bg-foreground text-background py-4 uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50"
            >
              {addToCart.isPending ? "Adding..." : product.inStock ? "Add to Bag" : "Out of Stock"}
            </button>
            <button className="p-4 border border-border hover:border-foreground transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Accordion Info */}
          <div className="border-t border-border">
            <div className="flex">
              <button 
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-4 text-sm tracking-widest uppercase border-b-2 transition-colors ${activeTab === "details" ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab("shipping")}
                className={`flex-1 py-4 text-sm tracking-widest uppercase border-b-2 transition-colors ${activeTab === "shipping" ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
              >
                Shipping
              </button>
            </div>
            <div className="py-6 text-sm text-muted-foreground leading-relaxed space-y-4">
              {activeTab === "details" ? (
                <>
                  <p>{product.description}</p>
                  {product.material && <p><strong>Material:</strong> {product.material}</p>}
                </>
              ) : (
                <p>Complimentary express shipping on all orders. Returns accepted within 14 days of delivery in original condition with tags attached. Please note that personalized items cannot be returned.</p>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
