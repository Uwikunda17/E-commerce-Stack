import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-border pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="col-span-1 md:col-span-6 lg:col-span-4">
            <Link href="/" className="font-display text-3xl tracking-[0.2em] text-foreground mb-6 block">
              LUXE
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8 font-display italic">
              Redefining Luxury Since 2024
            </p>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-foreground">Subscribe to our newsletter</p>
              <form className="flex border-b border-muted-foreground/30 pb-2 focus-within:border-primary transition-colors max-w-sm">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-transparent border-none outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button type="submit" className="text-xs tracking-widest uppercase text-primary hover:text-foreground transition-colors shrink-0 pl-4">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-3 lg:col-span-4 lg:pl-16">
            <h4 className="font-display uppercase tracking-widest text-sm mb-8 text-primary">Collections</h4>
            <ul className="space-y-4">
              <li><Link href="/products?category=women" className="text-muted-foreground hover:text-white transition-colors text-sm">Women</Link></li>
              <li><Link href="/products?category=men" className="text-muted-foreground hover:text-white transition-colors text-sm">Men</Link></li>
              <li><Link href="/products?category=shoes" className="text-muted-foreground hover:text-white transition-colors text-sm">Shoes</Link></li>
              <li><Link href="/products?category=accessories" className="text-muted-foreground hover:text-white transition-colors text-sm">Accessories</Link></li>
              <li><Link href="/products?featured=true" className="text-muted-foreground hover:text-white transition-colors text-sm">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-3 lg:col-span-4 lg:pl-8">
            <h4 className="font-display uppercase tracking-widest text-sm mb-8 text-primary">Client Services</h4>
            <ul className="space-y-4">
              <li><Link href="/account" className="text-muted-foreground hover:text-white transition-colors text-sm">My Account</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Shipping Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Returns & Exchanges</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-white transition-colors text-sm">Size Guide</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50">
          <p className="text-xs text-muted-foreground tracking-wide">© {new Date().getFullYear()} LUXE. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <span className="text-muted-foreground text-xs tracking-[0.2em]">
              VISA · MASTERCARD · AMEX · PAYPAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
