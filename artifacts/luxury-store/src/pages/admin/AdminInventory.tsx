import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { AlertTriangle, Package, Check, X } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  stockCount: number;
  inStock: boolean;
  price: number;
}

export function AdminInventory() {
  const { apiFetch } = useAdmin();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ stockCount: "", inStock: true });
  const [saving, setSaving] = useState(false);

  const load = () =>
    apiFetch("/api/admin/inventory")
      .then(r => r.json())
      .then(setItems)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const startEdit = (item: InventoryItem) => {
    setEditing(item.id);
    setEditForm({ stockCount: String(item.stockCount), inStock: item.inStock });
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    await apiFetch(`/api/admin/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stockCount: parseInt(editForm.stockCount), inStock: editForm.inStock }),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const lowStock = items.filter(i => i.stockCount <= 3 && i.inStock);
  const outOfStock = items.filter(i => !i.inStock);
  const healthy = items.filter(i => i.stockCount > 3 && i.inStock);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-widest mb-1">Inventory</h1>
        <p className="text-muted-foreground text-xs uppercase tracking-widest">{items.length} Products · {lowStock.length} Low Stock · {outOfStock.length} Out of Stock</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Healthy Stock", count: healthy.length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Low Stock (≤3)", count: lowStock.length, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Out of Stock", count: outOfStock.length, color: "text-destructive", bg: "bg-destructive/10" },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} border border-border p-4 text-center`}>
            <p className={`text-2xl font-display ${color}`}>{count}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-1">Low Stock Alert</p>
            <p className="text-xs text-muted-foreground">{lowStock.map(i => i.name).join(", ")} — consider restocking soon.</p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              {["Product", "Brand", "Price", "Stock", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                <td className="px-4 py-3 text-xs font-medium">{item.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.brand}</td>
                <td className="px-4 py-3 text-xs">${item.price.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {editing === item.id ? (
                    <input
                      type="number"
                      value={editForm.stockCount}
                      onChange={e => setEditForm({ ...editForm, stockCount: e.target.value })}
                      className="w-20 bg-background border border-primary px-2 py-1 text-xs focus:outline-none"
                      min="0"
                    />
                  ) : (
                    <span className={`text-xs font-mono ${item.stockCount <= 3 ? "text-amber-400" : "text-foreground"}`}>
                      {item.stockCount}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === item.id ? (
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={editForm.inStock} onChange={e => setEditForm({ ...editForm, inStock: e.target.checked })} className="accent-primary" />
                      <span className="text-[10px] uppercase tracking-widest">In Stock</span>
                    </label>
                  ) : (
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${item.inStock ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                      {item.inStock ? "In Stock" : "Out"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === item.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveEdit(item.id)} disabled={saving} className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(item)} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-current pb-0.5">
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
