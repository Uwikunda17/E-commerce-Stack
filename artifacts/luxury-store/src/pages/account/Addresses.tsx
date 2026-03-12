import { useState } from "react";
import { useAccount, Address } from "@/contexts/AccountContext";
import { MapPin, X, Check } from "lucide-react";

export default function Addresses() {
  const { savedAddresses, addAddress, removeAddress, setDefaultAddress } = useAccount();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Address, "id">>({
    label: "", street: "", city: "", zip: "", country: "", isDefault: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(formData);
    setIsAdding(false);
    setFormData({ label: "", street: "", city: "", zip: "", country: "", isDefault: false });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-2xl font-display uppercase tracking-widest">Address Book</h1>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs uppercase tracking-widest text-primary border-b border-primary pb-0.5 hover:text-foreground transition-colors"
          >
            Add New Address
          </button>
        )}
      </div>

      {savedAddresses.length === 0 && !isAdding ? (
        <div className="text-center py-20 bg-card border border-border flex flex-col items-center">
          <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-widest">No saved addresses. Add one for faster checkout.</p>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-8 py-3 bg-foreground text-background uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedAddresses.map(addr => (
            <div key={addr.id} className="bg-card border border-border p-6 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium uppercase tracking-widest text-sm">{addr.label}</h3>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] uppercase tracking-widest">Default</span>
                  )}
                </div>
                <button 
                  onClick={() => removeAddress(addr.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1 mb-6">
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.zip}</p>
                <p>{addr.country}</p>
              </div>

              {!addr.isDefault && (
                <button 
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="bg-card border border-border p-6 mt-8">
          <h3 className="font-medium uppercase tracking-widest text-sm mb-6">Add New Address</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <input required value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Label (e.g. Home, Office)" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div>
              <input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Street Address" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
              <input required value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} placeholder="ZIP Code" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div>
              <input required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} placeholder="Country" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            
            <label className="flex items-center gap-2 mt-4 cursor-pointer">
              <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="accent-primary" />
              <span className="text-sm text-muted-foreground">Set as default address</span>
            </label>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="px-8 py-3 bg-foreground text-background uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors">
                Save Address
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 border border-border uppercase tracking-widest text-xs font-medium hover:border-foreground transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
