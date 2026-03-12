import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder } from "@workspace/api-client-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const checkoutSchema = z.object({
  customerEmail: z.string().email("Please enter a valid email"),
  customerName: z.string().min(2, "Full name is required"),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(2, "City is required"),
  shippingZip: z.string().min(4, "ZIP code is required"),
  shippingCountry: z.string().min(2, "Country is required"),
  paymentMethod: z.enum(["credit_card", "paypal", "apple_pay"])
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const sessionId = useCartSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart(
    { sessionId: sessionId || "" },
    { query: { enabled: !!sessionId } }
  );

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        // Clear cart query
        queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        // Generate new session ID for next time implicitly
        localStorage.removeItem("luxury_store_session_id");
        setLocation(`/order/${order.id}`);
      },
      onError: () => {
        toast({ title: "Checkout Failed", description: "There was an error processing your order.", variant: "destructive" });
      }
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "credit_card"
    }
  });

  const onSubmit = (data: CheckoutForm) => {
    if (!sessionId || !cart || cart.items.length === 0) return;
    
    createOrder.mutate({
      data: {
        sessionId,
        ...data
      }
    });
  };

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center">
        <h2 className="text-2xl font-display mb-4">Your bag is empty</h2>
        <button onClick={() => setLocation("/products")} className="border-b border-foreground pb-1 uppercase tracking-widest text-sm">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-display uppercase tracking-widest mb-10 text-center">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Contact */}
            <section>
              <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-2 mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <input 
                    {...register("customerEmail")} 
                    placeholder="Email Address" 
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {errors.customerEmail && <p className="text-destructive text-xs mt-1">{errors.customerEmail.message}</p>}
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-2 mb-6">Shipping Address</h2>
              <div className="space-y-6">
                <div>
                  <input 
                    {...register("customerName")} 
                    placeholder="Full Name" 
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName.message}</p>}
                </div>
                <div>
                  <input 
                    {...register("shippingAddress")} 
                    placeholder="Street Address" 
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {errors.shippingAddress && <p className="text-destructive text-xs mt-1">{errors.shippingAddress.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input 
                      {...register("shippingCity")} 
                      placeholder="City" 
                      className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                    {errors.shippingCity && <p className="text-destructive text-xs mt-1">{errors.shippingCity.message}</p>}
                  </div>
                  <div>
                    <input 
                      {...register("shippingZip")} 
                      placeholder="ZIP / Postal Code" 
                      className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                    {errors.shippingZip && <p className="text-destructive text-xs mt-1">{errors.shippingZip.message}</p>}
                  </div>
                </div>
                <div>
                  <input 
                    {...register("shippingCountry")} 
                    placeholder="Country" 
                    className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                  {errors.shippingCountry && <p className="text-destructive text-xs mt-1">{errors.shippingCountry.message}</p>}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-2 mb-6">Payment</h2>
              <div className="space-y-4">
                {["credit_card", "paypal", "apple_pay"].map((method) => (
                  <label key={method} className="flex items-center p-4 border border-border cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="radio" 
                      value={method} 
                      {...register("paymentMethod")} 
                      className="accent-primary"
                    />
                    <span className="ml-3 text-sm uppercase tracking-widest">
                      {method.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                This is a demo. No real payment will be processed.
              </p>
            </section>

            <button 
              type="submit" 
              disabled={createOrder.isPending}
              className="w-full py-4 bg-foreground text-background uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50"
            >
              {createOrder.isPending ? "Processing..." : "Complete Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-card p-6 md:p-8 lg:sticky lg:top-24 border border-border">
          <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-2 mb-6">Order Summary</h2>
          
          <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto scrollbar-hide">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 aspect-[3/4] bg-muted shrink-0">
                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Size: {item.size} | Color: {item.color}</p>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-border text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between text-lg font-display pt-4 border-t border-border mt-4">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
