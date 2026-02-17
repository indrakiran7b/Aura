import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const footerLinks = {
  Shop: [
    { name: "All Products", href: "/shop" },
    { name: "Electronics", href: "/shop?category=Electronics" },
    { name: "Fashion", href: "/shop?category=Fashion" },
    { name: "Home & Living", href: "/shop?category=Home+%26+Living" },
  ],
  Company: [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Careers", href: "#" },
  ],
  Support: [
    { name: "FAQ", href: "#" },
    { name: "Shipping", href: "#" },
    { name: "Returns", href: "#" },
  ],
};

export default function Footer() {
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thanks for subscribing!");
  };

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <span className="font-display text-2xl font-bold">
              LUXE<span className="text-gradient-gold">.</span>
            </span>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Curated luxury products for the discerning shopper. Quality meets elegance.
            </p>
            <form onSubmit={handleNewsletter} className="mt-4 flex gap-2 max-w-xs">
              <Input placeholder="Your email" type="email" required className="h-9" />
              <Button size="sm" type="submit">Subscribe</Button>
            </form>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} LUXE. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
