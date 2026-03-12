import { useParams, Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { data: order, isLoading, isError } = useGetOrder(Number(id));

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center text-center">
        <h2 className="text-2xl font-display mb-4">Order Not Found</h2>
        <Link href="/" className="border-b border-foreground pb-1 uppercase tracking-widest text-sm">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display uppercase tracking-widest mb-4">Thank You</h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2">Order #{order.id.toString().padStart(6, '0')}</p>
        <p className="text-muted-foreground">A confirmation has been sent to {order.customerEmail}</p>
      </div>

      <div className="bg-card border border-border p-6 md:p-10">
        <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-4 mb-6">Order Details</h2>
        
        <div className="space-y-6 mb-8">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b border-border/50 pb-4 last:border-0">
              <div className="flex gap-4">
                <div className="w-16 aspect-[3/4] bg-muted shrink-0">
                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Size: {item.size} | Color: {item.color}</p>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Shipping</span>
            <span>$0.00</span>
          </div>
          <div className="flex justify-between text-lg font-display pt-4 border-t border-border mt-4">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-6 border-t border-border">
          <div>
            <h3 className="font-medium uppercase tracking-widest mb-3">Shipping Address</h3>
            <div className="text-muted-foreground space-y-1">
              <p>{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingCity}, {order.shippingZip}</p>
              <p>{order.shippingCountry}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium uppercase tracking-widest mb-3">Payment Method</h3>
            <p className="text-muted-foreground uppercase">{order.paymentMethod.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-block py-4 px-10 bg-foreground text-background uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
