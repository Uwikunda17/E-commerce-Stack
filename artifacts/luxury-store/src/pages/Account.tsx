import { useState } from "react";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Package, Heart, MapPin, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useAccount } from "@/contexts/AccountContext";

import Dashboard from "./account/Dashboard";
import Orders from "./account/Orders";
import Wishlist from "./account/Wishlist";
import Addresses from "./account/Addresses";
import Settings from "./account/Settings";

export default function Account() {
  const { isLoggedIn, login, logout } = useAccount();
  const [location, setLocation] = useLocation();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginTab) {
      login(email.split('@')[0], email);
    } else {
      login(`${firstName} ${lastName}`, email);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-20 min-h-screen px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-card border border-border p-8">
          <div className="flex mb-8 border-b border-border">
            <button 
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 pb-4 text-sm font-medium uppercase tracking-widest transition-colors ${isLoginTab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 pb-4 text-sm font-medium uppercase tracking-widest transition-colors ${!isLoginTab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {!isLoginTab && (
              <div className="grid grid-cols-2 gap-4">
                <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
                <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
            )}
            
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-primary transition-colors text-sm" />

            {!isLoginTab && (
              <label className="flex items-start gap-2 mt-4 cursor-pointer">
                <input type="checkbox" className="accent-primary mt-1" />
                <span className="text-xs text-muted-foreground leading-relaxed">Subscribe to receive updates, access to exclusive deals, and more.</span>
              </label>
            )}

            <button type="submit" className="w-full py-4 bg-foreground text-background uppercase tracking-widest text-sm font-medium hover:bg-primary transition-colors mt-8">
              {isLoginTab ? "Sign In" : "Create Account"}
            </button>
            
            {isLoginTab && (
              <div className="text-center mt-4">
                <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                  Forgot Password?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  const subRoute = location.replace("/account", "") || "/";

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/orders", label: "Orders", icon: Package },
    { path: "/wishlist", label: "Wishlist", icon: Heart },
    { path: "/addresses", label: "Addresses", icon: MapPin },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 shrink-0">
        <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide space-x-4 lg:space-x-0 lg:space-y-2">
          {navItems.map(item => {
            const isActive = subRoute === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={`/account${item.path === '/' ? '' : item.path}`}>
                <div className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest transition-all whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                  isActive 
                    ? 'text-primary bg-primary/5 border-l-2 border-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-card border-l-2 border-transparent'
                }`}>
                  <Icon className="w-4 h-4" /> {item.label}
                </div>
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-card border-l-2 border-transparent transition-all whitespace-nowrap lg:whitespace-normal w-full text-left"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {subRoute === "/" && <Dashboard />}
        {subRoute === "/orders" && <Orders />}
        {subRoute === "/wishlist" && <Wishlist />}
        {subRoute === "/addresses" && <Addresses />}
        {subRoute === "/settings" && <Settings />}
      </main>
    </div>
  );
}
