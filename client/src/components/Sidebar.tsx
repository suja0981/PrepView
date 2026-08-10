import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Plus, FileSearch, X, Crown,
  Sparkles, CreditCard, ChevronRight, HelpCircle
} from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview/create", label: "Practice Hub", icon: Plus, badge: "New" },
  { to: "/resume", label: "Resume AI", icon: FileSearch },
];

const secondaryNav = [
  { to: "/pricing", label: "Pricing & Plans", icon: CreditCard },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthContext();
  const isPremium = user?.plan === "premium";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border/50 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[12px] font-bold text-primary-foreground shadow-sm shadow-primary/20">
              P
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              PrepView
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">

          {/* Main Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">
              Platform
            </p>
            {mainNav.map(({ to, label, icon: Icon, badge }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={16}
                      className={`transition-colors ${
                        active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                      }`}
                    />
                    <span>{label}</span>
                  </div>

                  {badge && !active && (
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      {badge}
                    </span>
                  )}

                  {/* Active vertical bar indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Preferences / Account Section */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">
              Account & Billing
            </p>
            {secondaryNav.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={16}
                      className={`transition-colors ${
                        active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                      }`}
                    />
                    <span>{label}</span>
                  </div>
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Widget */}
        <div className="p-3 border-t border-border/50">
          {isPremium ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Crown size={14} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground leading-tight">Premium Active</p>
                  <p className="text-[10px] text-muted-foreground">Unlimited access</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl border border-border/60 bg-secondary/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary uppercase tracking-wider">
                  <Sparkles size={11} /> Pro Features
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">$9/mo</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unlock Voice mode, System Design & unlimited practice.
              </p>
              <Link
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-primary py-1.5 text-[11px] font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Upgrade now <ChevronRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
