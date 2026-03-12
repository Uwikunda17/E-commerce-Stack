import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { AdminProducts } from "./AdminProducts";
import { AdminOrders } from "./AdminOrders";
import { AdminCategories } from "./AdminCategories";
import { AdminInventory } from "./AdminInventory";
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Boxes,
  LogOut, Menu, X, Shield, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/backstage-luxe" },
  { id: "products", label: "Products", icon: Package, path: "/backstage-luxe/products" },
  { id: "orders", label: "Orders", icon: ShoppingBag, path: "/backstage-luxe/orders" },
  { id: "categories", label: "Categories", icon: Tag, path: "/backstage-luxe/categories" },
  { id: "inventory", label: "Inventory", icon: Boxes, path: "/backstage-luxe/inventory" },
];

function getActivePage(pathname: string): string {
  if (pathname.includes("/products")) return "products";
  if (pathname.includes("/orders")) return "orders";
  if (pathname.includes("/categories")) return "categories";
  if (pathname.includes("/inventory")) return "inventory";
  return "dashboard";
}

function renderPage(page: string) {
  switch (page) {
    case "products": return <AdminProducts />;
    case "orders": return <AdminOrders />;
    case "categories": return <AdminCategories />;
    case "inventory": return <AdminInventory />;
    default: return <AdminDashboard />;
  }
}

export default function AdminPanel() {
  const { isAdmin, logout } = useAdmin();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activePage = getActivePage(location);

  if (!isAdmin) {
    return <AdminLogin onSuccess={() => setLocation("/backstage-luxe")} />;
  }

  const navigate = (path: string) => {
    setLocation(path);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <>
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-card shrink-0 sticky top-0 h-screen">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center rounded">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display text-sm tracking-widest">LUXE</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Console</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
              <button
                key={id}
                onClick={() => navigate(path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs uppercase tracking-widest transition-all duration-200 group",
                  activePage === id
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-l-2 border-transparent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {activePage === id && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </button>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-border">
            <button
              onClick={() => { logout(); setLocation("/"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 flex flex-col lg:hidden"
              >
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-display text-sm tracking-widest">Admin Console</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                  {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => (
                    <button
                      key={id}
                      onClick={() => navigate(path)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left text-xs uppercase tracking-widest transition-all",
                        activePage === id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </nav>
                <div className="px-3 pb-6 border-t border-border pt-4">
                  <button onClick={() => { logout(); setLocation("/"); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {NAV_ITEMS.find(n => n.id === activePage)?.label}
            </p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-current pb-0.5"
          >
            ← Back to Store
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage(activePage)}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
