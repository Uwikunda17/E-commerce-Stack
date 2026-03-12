import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Plus, Pencil, Trash2, X, Check, AlertTriangle } from "lucide-react";

interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; brand: string; description: string;
  price: number; originalPrice: number | null; categoryId: number; categoryName: string;
  images: string[]; sizes: string[]; colors: string[]; material: string | null;
  inStock: boolean; stockCount: number; featured: boolean; rating: number | null;
  reviewCount: number; tags: string[]; createdAt: string;
}

const emptyForm = {
  name: "", brand: "", description: "", price: "",
  originalPrice: "", categoryId: "", material: "",
  images: "", sizes: "", colors: "", tags: "",
  inStock: true, stockCount: "10", featured: false,
};

export function AdminProducts() {
  const { apiFetch } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [p, c] = await Promise.all([
      apiFetch("/api/admin/products").then(r => r.json()),
      apiFetch("/api/admin/categories").then(r => r.json()),
    ]);
    setProducts(p);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, description: p.description,
      price: String(p.price), originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      categoryId: String(p.categoryId), material: p.material || "",
      images: p.images.join("\n"), sizes: p.sizes.join(", "), colors: p.colors.join(", "),
      tags: p.tags.join(", "), inStock: p.inStock, stockCount: String(p.stockCount),
      featured: p.featured,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name, brand: form.brand, description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      categoryId: parseInt(form.categoryId),
      material: form.material || null,
      images: form.images.split("\n").map(s => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
      inStock: form.inStock,
      stockCount: parseInt(form.stockCount),
      featured: form.featured,
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    await apiFetch(url, { method, body: JSON.stringify(body) });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-widest mb-1">Products</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">{products.length} Total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <input
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm bg-card border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
      />

      {showForm && (
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium uppercase tracking-widest">{editingId ? "Edit Product" : "New Product"}</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Product Name", required: true },
                { key: "brand", label: "Brand", required: true },
                { key: "price", label: "Price ($)", type: "number", required: true },
                { key: "originalPrice", label: "Original Price ($) — optional", type: "number" },
                { key: "material", label: "Material" },
                { key: "stockCount", label: "Stock Count", type: "number", required: true },
              ].map(({ key, label, type = "text", required }) => (
                <div key={key}>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    step={type === "number" ? "0.01" : undefined}
                    className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value })}
                  required
                  className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Sizes (comma-separated)</label>
                <input type="text" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="XS, S, M, L, XL" className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Colors (comma-separated)</label>
                <input type="text" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Gold" className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="luxury, new, sale" className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Image URLs (one per line)</label>
              <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={3} placeholder="https://..." className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors resize-none font-mono text-xs" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.inStock} onChange={e => setForm({ ...form, inStock: e.target.checked })} className="accent-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Featured</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-border text-xs uppercase tracking-widest hover:border-foreground transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {["Product", "Brand", "Category", "Price", "Stock", "Featured", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover bg-background" />}
                    <span className="text-xs font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.brand}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{p.categoryName}</td>
                <td className="px-4 py-3">
                  <div className="text-xs">
                    <span className="text-primary font-medium">${p.price.toFixed(2)}</span>
                    {p.originalPrice && <span className="text-muted-foreground line-through ml-2 text-[10px]">${p.originalPrice.toFixed(2)}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${p.stockCount <= 3 ? "bg-amber-500/10 text-amber-400" : p.inStock ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                    {p.inStock ? `${p.stockCount} left` : "Out"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.featured ? <Check className="w-4 h-4 text-primary" /> : <span className="text-muted-foreground/30">—</span>}
                </td>
                <td className="px-4 py-3">
                  {deleteConfirm === p.id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-muted-foreground text-xs uppercase tracking-widest">No products found</p>
        )}
      </div>
    </div>
  );
}
