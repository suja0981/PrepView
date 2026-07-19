import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut, Sun, Moon, Menu,
  Plus, ChevronDown, Settings,
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { useLogout } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuthContext();
  const logoutMutation = useLogout();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out");
      navigate("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <Menu size={16} />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">P</span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground hidden sm:inline-block">PrepView</span>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Quick action */}
          <Link
            to="/interview/create"
            className="hidden sm:flex items-center gap-1.5 h-8 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 ml-1"
          >
            <Plus size={13} />
            New
          </Link>

          {/* User dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary"
            >
              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary border border-primary/20">
                {initials}
              </div>
              <ChevronDown
                size={13}
                className={`text-muted-foreground transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="px-4 py-3 bg-secondary/40 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-[13px] font-bold text-primary border border-primary/20">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Settings size={13} />
                    Settings
                    <span className="ml-auto text-[10px] border border-border rounded px-1 py-0.5 text-muted-foreground/60">soon</span>
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut size={13} />
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
