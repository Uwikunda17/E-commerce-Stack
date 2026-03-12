import { useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { login } = useAdmin();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setIsLoading(true);
    setError("");

    const ok = await login(password);
    setIsLoading(false);

    if (ok) {
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        setError("Too many failed attempts. Access locked for this session.");
      } else {
        setError(`Invalid credentials. ${5 - newAttempts} attempt${5 - newAttempts !== 1 ? "s" : ""} remaining.`);
      }
      setPassword("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl tracking-widest uppercase mb-2">LUXE Admin</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">Secure Management Console</p>
        </div>

        {locked ? (
          <div className="bg-destructive/10 border border-destructive/20 p-6 text-center">
            <Lock className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-destructive text-sm">Session locked due to too many failed attempts.</p>
            <p className="text-muted-foreground text-xs mt-2">Please refresh the page to try again.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Admin Password"
                autoComplete="current-password"
                className="w-full bg-card border border-border px-4 py-3.5 text-sm focus:outline-none focus:border-primary transition-colors pr-12 tracking-wider"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-destructive text-xs text-center uppercase tracking-wider">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3.5 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        )}

        <p className="text-center text-muted-foreground text-[10px] mt-8 uppercase tracking-widest">
          This area is restricted to authorized personnel only
        </p>
      </div>
    </motion.div>
  );
}
