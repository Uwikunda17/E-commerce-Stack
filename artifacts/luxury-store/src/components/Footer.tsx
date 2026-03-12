import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-display text-2xl tracking-[0.2em] text-foreground mb-6 block">
              LUXE
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Redefining modern elegance with uncompromising quality and timeless design.
            </p>
          </div>
          
          <div>
            <h4 className="font-display uppercase tracking-widest text-sm mb-6 text-foreground">Explore</h4>
            <ul className="space-y-4">
              <li><Link href="/products?featured=true" className="text-muted-foreground hover:text-primary transition-colors text-sm">New Arrivals</Link></li>
              <li><Link href="/products?category=women" className="text-muted-foreground hover:text-primary transition-colors text-sm">Women's Collection</Link></li>
              <li><Link href="/products?category=men" className="text-muted-foreground hover:text-primary transition-colors text-sm">Men's Collection</Link></li>
              <li><Link href="/products?category=accessories" className="text-muted-foreground hover:text-primary transition-colors text-sm">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display uppercase tracking-widest text-sm mb-6 text-foreground">Assistance</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Shipping & Returns</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Size Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Track Order</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display uppercase tracking-widest text-sm mb-6 text-foreground">Newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex border-b border-muted-foreground/30 pb-2 focus-within:border-primary transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button type="submit" className="text-xs tracking-widest uppercase text-foreground hover:text-primary transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LUXE. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
