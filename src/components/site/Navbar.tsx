import { Link, useNavigate } from "@tanstack/react-router";
import { Zap, Menu, X, LogOut, Coins } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/history", label: "History" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, displayName } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary group-hover:bg-primary/20 transition-colors">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight">
            Ez<span className="text-primary">verse</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <div className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium border border-border rounded-md bg-surface-1 text-muted-foreground" title="Remaining Credits">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>{profile?.credits ?? '...'}</span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 h-9 px-3 text-sm font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                {displayName}
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="inline-flex items-center justify-center h-9 w-9 border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center h-9 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((s) => !s)}
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-border"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container-page py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <div className="col-span-2 inline-flex items-center justify-center gap-1.5 h-9 px-4 text-sm font-medium border border-border rounded-md bg-surface-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>{profile?.credits ?? '...'} credits</span>
                  </div>
                  <div className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-border rounded-md">
                    {displayName}
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="inline-flex items-center justify-center h-9 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-md"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium border border-border rounded-md"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center h-9 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
