import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { 
  useGetCart, 
  useUpdateCartItem, 
  useRemoveCartItem 
} from "@workspace/api-client-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { formatPrice } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  
  const { data: cart, isLoading } = useGetCart(
    { sessionId: sessionId || "" },
    { query: { enabled: !!sessionId && isOpen } }
  );

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    }
  });

  const removeItem = useRemoveCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      }
    }
  });

  const handleUpdateQuantity = (itemId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (!sessionId) return;
    
    updateItem.mutate({
      itemId,
      data: { sessionId, quantity: newQty }
    });
  };

  const handleRemove = (itemId: number) => {
    if (!sessionId) return;
    removeItem.mutate({
      itemId,
      params: { sessionId }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "circOut" }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl uppercase tracking-widest">Shopping Bag</h2>
              <button onClick={onClose} className="p-2 hover:text-primary transition-colors text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                  <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center border border-border">
                    <span className="text-xl">0</span>
                  </div>
                  <p className="uppercase tracking-widest text-sm">Your bag is empty</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-xs uppercase tracking-widest border-b border-primary text-primary pb-1"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-24 aspect-[3/4] bg-card overflow-hidden">
                        <img 
                          src={item.productImage || "https://images.unsplash.com/photo-1515347619362-710c0e181827?w=400&q=80"} 
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{item.productBrand}</p>
                            <Link href={`/products/${item.productId}`} onClick={onClose} className="text-sm font-medium hover:text-primary transition-colors">
                              {item.productName}
                            </Link>
                          </div>
                          <button 
                            onClick={() => handleRemove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                          <p className="text-xs text-muted-foreground">Color: {item.color}</p>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="flex items-center border border-border">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              disabled={updateItem.isPending || item.quantity <= 1}
                              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              disabled={updateItem.isPending}
                              className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart && cart.items.length > 0 && (
              <div className="p-6 border-t border-border bg-card/50">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-6">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-display mb-6">
                  <span>Total</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                
                <Link href="/checkout" onClick={onClose} className="block w-full">
                  <button className="w-full py-4 bg-foreground text-background font-medium tracking-widest uppercase text-sm hover:bg-primary transition-colors">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
