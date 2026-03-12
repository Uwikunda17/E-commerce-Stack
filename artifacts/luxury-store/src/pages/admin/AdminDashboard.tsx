import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Package, ShoppingBag, TrendingUp, AlertTriangle, DollarSign, Tag, Clock } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }>;
  lowStockCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400",
  processing: "bg-amber-500/10 text-amber-400",
  shipped: "bg-blue-500/10 text-blue-400",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

export function AdminDashboard() {
  const { apiFetch } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <div className="text-destructive text-center py-12">Failed to load stats</div>;

  const statCards = [
    { icon: Package, label: "Total Products", value: stats.totalProducts, color: "text-primary" },
    { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "text-blue-400" },
    { icon: DollarSign, label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-emerald-400" },
    { icon: Tag, label: "Categories", value: stats.totalCategories, color: "text-purple-400" },
    { icon: AlertTriangle, label: "Low Stock Items", value: stats.lowStockCount, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-widest mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Overview · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
            <p className={`text-2xl font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-medium uppercase tracking-widest">Recent Orders</h2>
        </div>
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Order</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Customer</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal hidden md:table-cell">Items</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Total</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">Status</th>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground text-xs uppercase tracking-widest">
                    No orders yet
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-primary text-xs">
                      #{String(order.id).padStart(6, "0")}
                    </td>
                    <td className="px-5 py-3.5 text-xs">{order.customerName}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">{order.itemCount}</td>
                    <td className="px-5 py-3.5 text-xs font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
