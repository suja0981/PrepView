import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  LogOut, Sun, Moon, Menu,
  Plus, ChevronDown, Settings, Crown, Search, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Failed to log out");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "PV";

  const isPremium = user?.plan === "premium";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">

        {/* Left Section — Mobile Menu & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            <Menu size={16} />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground shadow-sm shadow-primary/20 transition-transform group-hover:scale-105">
              P
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground hidden sm:inline-block">
              PrepView
            </span>
          </Link>
        </div>

        {/* Center Section — Search / Command Trigger Mock */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => navigate("/interview/create")}
            className="flex h-8 w-64 items-center justify-between rounded-lg border border-border/60 bg-secondary/30 px-3 text-[12px] text-muted-foreground transition-colors hover:border-border hover:bg-secondary/60"
          >
            <span className="flex items-center gap-2">
              <Search size={13} className="text-muted-foreground/70" />
              <span>Search or start interview...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-card px-1 font-mono text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section — Theme, Action, User */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Quick Action — New Interview */}
          <Link
            to="/interview/create"
            className="hidden sm:flex items-center gap-1.5 h-8 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
          >
            <Plus size={14} />
            <span>New Session</span>
          </Link>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-secondary/60"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary border border-primary/20">
                {initials}
                {isPremium && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                    <Crown size={8} />
                  </span>
                )}
              </div>
              <ChevronDown
                size={13}
                className={`text-muted-foreground transition-transform duration-200 hidden sm:block ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden z-50"
                >
                  {/* User Profile Header */}
                  <div className="px-4 py-3 bg-secondary/30 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-[13px] font-bold text-primary border border-primary/20">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">{user?.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>

                    {/* Plan Badge */}
                    <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plan</span>
                      {isPremium ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                          <Crown size={10} /> Pro Plan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Free Tier
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Actions */}
                  <div className="p-1.5 space-y-0.5">
                    {!isPremium ? (
                      <Link
                        to="/pricing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <Sparkles size={14} />
                        Upgrade to Pro
                      </Link>
                    ) : (
                      <Link
                        to="/pricing"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-amber-500 transition-colors hover:bg-amber-500/10"
                      >
                        <Crown size={14} />
                        Manage Subscription
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        toast.info("Account settings page coming soon");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Settings size={14} />
                      Settings
                      <span className="ml-auto text-[10px] border border-border rounded-md px-1.5 py-0.5 text-muted-foreground/60">Soon</span>
                    </button>

                    <div className="my-1 h-px bg-border/50" />

                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut size={14} />
                      {logoutMutation.isPending ? "Logging out..." : "Log out"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
