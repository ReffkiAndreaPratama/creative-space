import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const NAV_LINKS = [
  { to: "/photography", label: "Photography" },
  { to: "/art", label: "Art" },
  { to: "/guitar", label: "Guitar" },
  { to: "/videos", label: "Videos" },
  { to: "/journal", label: "Journal" },
  { to: "/projects", label: "Projects" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Track scroll for navbar style change
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
          scrolled
            ? "border-b border-border bg-background/80 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <nav className="container-wide flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
          >
            Nexreff
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    isActive ? "text-accent" : "text-muted"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={isAuthenticated ? "/admin" : "/admin/login"}
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
              aria-label="Admin dashboard"
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only">Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="text-foreground lg:hidden focus-ring rounded-md p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-background animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex h-full flex-col pt-20 px-6 animate-fade-in-up">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "border-b border-border py-3 font-display text-lg transition-colors hover:text-accent",
                      isActive ? "text-accent" : "text-foreground"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={isAuthenticated ? "/admin" : "/admin/login"}
                className="flex items-center gap-2 border-b border-border py-3 font-display text-lg text-muted transition-colors hover:text-accent"
              >
                <Lock className="h-4 w-4" />
                Admin
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
