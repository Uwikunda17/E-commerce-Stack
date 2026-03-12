import { Link } from "wouter";
import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function Orders() {
  const orderHistoryStr = localStorage.getItem('luxe_order_history');
  const orders = orderHistoryStr ? JSON.parse(orderHistoryStr) : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display uppercase tracking-widest border-b border-border pb-4">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border flex flex-col items-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-6 uppercase tracking-widest text-sm">You have no previous orders.</p>
          <Link href="/products" className="px-8 py-3 bg-foreground text-background uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-card border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-widest">Order #{order.id.toString().padStart(6, '0')}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs text-muted-foreground">{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</p>
              </div>
              <div className="text-lg font-display text-primary">
                {formatPrice(order.total)}
              </div>
              <div>
                <span className={`px-3 py-1 text-[10px] uppercase tracking-widest ${
                  order.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                  order.status === 'processing' ? 'bg-amber-500/10 text-amber-500' :
                  order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-primary/10 text-primary'
                }`}>
                  {order.status}
                </span>
              </div>
              <Link href={`/order/${order.id}`} className="px-6 py-2 border border-border text-xs uppercase tracking-widest hover:border-foreground transition-colors">
                View Order
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
