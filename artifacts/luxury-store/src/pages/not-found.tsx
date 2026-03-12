import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 flex flex-col items-center text-center px-4">
      <h1 className="text-8xl font-display mb-4">404</h1>
      <h2 className="text-2xl font-display uppercase tracking-widest mb-6">Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-10">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/" className="border-b border-foreground pb-1 uppercase tracking-widest text-sm hover:text-primary hover:border-primary transition-colors">
        Return Home
      </Link>
    </div>
  );
}
