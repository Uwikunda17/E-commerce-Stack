import { Link } from "wouter";
import { useAccount } from "@/contexts/AccountContext";

export default function Dashboard() {
  const { accountData, wishlist, savedAddresses } = useAccount();
  
  const orderHistoryStr = localStorage.getItem('luxe_order_history');
  const orders = orderHistoryStr ? JSON.parse(orderHistoryStr) : [];
  const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-display uppercase tracking-widest mb-2">Welcome back, {accountData?.name}</h1>
        <p className="text-muted-foreground text-sm">Manage your personal details, view orders, and explore your wishlist.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 flex flex-col justify-center items-center text-center">
          <span className="text-3xl font-display text-primary mb-2">{wishlist.length}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Wishlist Items</span>
        </div>
        <div className="bg-card border border-border p-6 flex flex-col justify-center items-center text-center">
          <span className="text-3xl font-display text-primary mb-2">{savedAddresses.length}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Saved Addresses</span>
        </div>
        <div className="bg-card border border-border p-6 flex flex-col justify-center items-center text-center">
          <span className="text-lg font-medium text-primary mb-2 uppercase tracking-widest">{lastOrder ? lastOrder.status : 'None'}</span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Last Order Status</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/products?featured=true" className="flex-1 py-4 bg-foreground text-background text-center uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors">
          Browse New Arrivals
        </Link>
        <Link href="/account/wishlist" className="flex-1 py-4 border border-border text-center uppercase tracking-widest text-xs font-medium hover:border-foreground transition-colors">
          View Wishlist
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-medium uppercase tracking-widest border-b border-border pb-4 mb-6">Recent Order</h2>
        {lastOrder ? (
          <div className="bg-card border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest mb-1">Order #{lastOrder.id.toString().padStart(6, '0')}</p>
              <p className="text-xs text-muted-foreground">{new Date(lastOrder.date).toLocaleDateString()}</p>
            </div>
            <div className="text-sm font-medium">${(lastOrder.total / 100).toFixed(2)}</div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs uppercase tracking-widest">{lastOrder.status}</div>
            <Link href={`/order/${lastOrder.id}`} className="text-xs uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-primary transition-colors">
              View Details
            </Link>
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link href="/products" className="text-xs uppercase tracking-widest border-b border-foreground pb-0.5 hover:text-primary transition-colors">
              Shop Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
