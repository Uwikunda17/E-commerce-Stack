import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGetCart } from "@workspace/api-client-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAdmin } from "@/contexts/AdminContext";

interface NavbarProps {
  onOpenCart: () => void;
}

export function Navbar({ onOpenCart }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const sessionId = useCartSession();
  const { isAdmin } = useAdmin();

  const { data: cart } = useGetCart(
    { sessionId: sessionId || "" },
    { query: { enabled: !!sessionId } }
  );

  const itemCount = cart?.itemCount || 0;
  const isHome = location === "/";

  // ── Easter Egg: Triple-click on LUXE logo ──────────────────────────────
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretPassword, setSecretPassword] = useState("");
  const [secretError, setSecretError] = useState("");
  const [secretLoading, setSecretLoading] = useState(false);
  const { login } = useAdmin();

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    clickCountRef.current += 1;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      setShowSecretModal(true);
      setSecretPassword("");
      setSecretError("");
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      if (clickCountRef.current === 1) {
        setLocation("/");
      }
      clickCountRef.current = 0;
    }, 400);
  }, [setLocation]);

  const handleSecretLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecretLoading(true);
    setSecretError("");
    const ok = await login(secretPassword);
    setSecretLoading(false);
    if (ok) {
      setShowSecretModal(false);
      setLocation("/backstage-luxe");
    } else {
      setSecretError("Access denied.");
      setSecretPassword("");
    }
  };
  // ──────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "New Arrivals", href: "/products?featured=true" },
    { name: "Women", href: "/products?category=women" },
    { name: "Men", href: "/products?category=men" },
    { name: "Accessories", href: "/products?category=accessories" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-500 ease-in-out border-b border-transparent top-9",
          isScrolled || !isHome
            ? "bg-background/95 backdrop-blur-md border-border py-4"
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm tracking-widest uppercase text-foreground/80 hover:text-primary transition-colors duration-300 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Logo — triple-click for admin easter egg */}
            <button
              onClick={handleLogoClick}
              className="absolute left-1/2 -translate-x-1/2 text-2xl md:text-3xl font-display font-bold tracking-[0.2em] text-foreground cursor-pointer select-none"
            >
              LUXE
            </button>

            {/* Right Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="p-2 text-foreground/80 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setLocation("/account")}
                className="p-2 text-foreground/80 hover:text-primary transition-colors hidden sm:block"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenCart}
                className="p-2 text-foreground/80 hover:text-primary transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setLocation("/backstage-luxe")}
                  className="hidden sm:block p-2 text-primary hover:text-primary/80 transition-colors"
                  title="Admin Panel"
                >
                  <span className="text-[10px] uppercase tracking-widest border border-primary px-2 py-1">Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secret Admin Login Modal */}
      <AnimatePresence>
        {showSecretModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={e => { if (e.target === e.currentTarget) setShowSecretModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border p-8 w-full max-w-xs"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-lg font-display">★</span>
                </div>
                <p className="font-display text-sm tracking-widest uppercase">Restricted Access</p>
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-1">Enter admin credentials</p>
              </div>
              <form onSubmit={handleSecretLogin} className="space-y-4">
                <input
                  type="password"
                  value={secretPassword}
                  onChange={e => setSecretPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors tracking-wider"
                />
                {secretError && (
                  <p className="text-destructive text-[10px] uppercase tracking-widest text-center">{secretError}</p>
                )}
                <button
                  type="submit"
                  disabled={secretLoading || !secretPassword}
                  className="w-full py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {secretLoading ? "..." : "Enter"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSecretModal(false)}
                  className="w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border mt-9">
              <span className="font-display text-xl tracking-[0.2em]">LUXE</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-6 space-y-6 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl tracking-widest uppercase font-display"
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-border my-4" />

              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl tracking-widest uppercase font-display flex items-center gap-3 text-primary"
              >
                <User className="w-5 h-5" />
                My Account
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
