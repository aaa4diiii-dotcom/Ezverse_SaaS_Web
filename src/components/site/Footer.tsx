import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container-page py-10 grid gap-8 md:grid-cols-[1fr_auto] items-start">
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary">
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold tracking-tight">
              Ez<span className="text-primary">verse</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-sm">
            Every AI tool you need. One platform. Pay as you go.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/tools" className="hover:text-foreground transition-colors">Tools</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Log In</Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ezverse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
