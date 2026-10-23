import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Upload,
  FileText,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/media", label: "Media Manager", icon: ImageIcon, end: false },
  { to: "/admin/upload", label: "Upload", icon: Upload, end: false },
  { to: "/admin/journal", label: "Journal", icon: FileText, end: false },
  { to: "/admin/collections", label: "Collections", icon: FolderKanban, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

export function AdminLayout() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed left-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-surface transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/admin" className="font-display text-lg font-bold text-foreground">
            Admin
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:bg-surface-hover hover:text-foreground"
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}

          <div className="mt-auto pt-4">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Site
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-background/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <main className="min-h-screen p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
