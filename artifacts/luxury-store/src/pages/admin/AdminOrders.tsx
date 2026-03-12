import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  productId: number;
  productName: string;
  productBrand: string;
  productImage: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  shippingCountry: string;
  paymentMethod: string;
  status: string;
  total: number;
  subtotal: number;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
}

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  processing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-muted text-muted-foreground border-border",
};

export function AdminOrders() {
  const { apiFetch } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const load = () =>
    apiFetch("/api/admin/orders")
      .then(r => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    await apiFetch(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    load();
  };

  const filtered = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-widest mb-1">Orders</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">{orders.length} Total · ${orders.reduce((s, o) => s + o.total, 0).toFixed(2)} Revenue</p>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card border border-border p-10 text-center">
            <p className="text-muted-foreground text-xs uppercase tracking-widest">No orders found</p>
          </div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="bg-card border border-border overflow-hidden">
            <div
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer hover:bg-background/30 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                <div>
                  <p className="font-mono text-primary text-xs font-medium">#{String(order.id).padStart(6, "0")}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium">{order.customerName}</p>
                  <p className="text-[10px] text-muted-foreground">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs font-medium">${order.total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">{order.itemCount} item{order.itemCount !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={order.status}
                  onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                  disabled={updatingId === order.id}
                  className="bg-background border border-border px-2 py-1.5 text-[10px] uppercase tracking-widest focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-border p-5 space-y-4 bg-background/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Ship To</p>
                    <p>{order.shippingCity}, {order.shippingCountry}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Payment</p>
                    <p className="capitalize">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Subtotal</p>
                    <p>${order.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                    <p className="font-medium text-primary">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border/50">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-12 h-14 object-cover bg-background shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.productBrand}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                        </div>
                        <p className="text-xs font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
