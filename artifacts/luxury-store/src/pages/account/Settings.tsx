import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { accountData, updateProfile } = useAccount();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: accountData?.name || "",
    email: accountData?.email || "",
    phone: accountData?.phone || ""
  });

  const [passData, setPassData] = useState({
    current: "", new: "", confirm: ""
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast({ title: "Profile Updated", description: "Changes saved successfully." });
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setPassData({ current: "", new: "", confirm: "" });
    toast({ title: "Security Updated", description: "Password changed successfully." });
  };

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-display uppercase tracking-widest border-b border-border pb-4">Account Settings</h1>

      <section>
        <h2 className="text-lg font-medium uppercase tracking-widest mb-6">Personal Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Full Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <button type="submit" className="px-8 py-3 bg-foreground text-background uppercase tracking-widest text-xs font-medium hover:bg-primary transition-colors">
            Save Changes
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium uppercase tracking-widest mb-6">Newsletter Preferences</h2>
        <div className="space-y-4 max-w-xl">
          {["New Arrivals", "Sales & Promotions", "Style Edit"].map(pref => (
            <label key={pref} className="flex items-center gap-3 cursor-pointer p-4 border border-border hover:border-primary transition-colors">
              <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
              <span className="text-sm uppercase tracking-widest">{pref}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium uppercase tracking-widest mb-6">Security</h2>
        <form onSubmit={handlePasswordSave} className="space-y-6 max-w-xl">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Current Password</label>
            <input required type="password" value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">New Password</label>
            <input required type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block">Confirm Password</label>
            <input required type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
          </div>
          <button type="submit" className="px-8 py-3 border border-border uppercase tracking-widest text-xs font-medium hover:border-foreground transition-colors">
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
