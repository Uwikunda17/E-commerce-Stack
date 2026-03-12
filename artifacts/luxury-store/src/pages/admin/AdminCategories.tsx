import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Plus, Trash2, X, Check } from "lucide-react";

interface Category { id: number; name: string; slug: string; description: string | null; imageUrl: string | null; }

export function AdminCategories() {
  const { apiFetch } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = () => apiFetch("/api/admin/categories").then(r => r.json()).then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await apiFetch("/api/admin/categories", { method: "POST", body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", slug: "", description: "", imageUrl: "" });
    load();
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    load();
  };

  const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-widest mb-1">Categories</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">{categories.length} Total</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium uppercase tracking-widest">New Category</h2>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Name</label>
                <input
                  type="text" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                  className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Slug</label>
                <input
                  type="text" value={form.slug} required
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Image URL</label>
                <input type="text" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? "Creating..." : "Create Category"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-border text-xs uppercase tracking-widest hover:border-foreground transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-card border border-border p-5 flex items-center gap-4 group">
            {cat.imageUrl ? (
              <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-cover bg-background shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-background border border-border shrink-0 flex items-center justify-center text-muted-foreground text-xs">IMG</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">/{cat.slug}</p>
              {cat.description && <p className="text-xs text-muted-foreground mt-1 truncate">{cat.description}</p>}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {deleteConfirm === cat.id ? (
                <>
                  <button onClick={() => handleDelete(cat.id)} className="text-destructive hover:text-destructive/80 transition-colors" title="Confirm delete"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteConfirm(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <button onClick={() => setDeleteConfirm(cat.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
