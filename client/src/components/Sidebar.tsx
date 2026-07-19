import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, FileSearch, X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/interview/create", label: "Practice", icon: Plus },
  { to: "/resume", label: "Resume AI", icon: FileSearch },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-lg transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 border-b border-border md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
              P
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              PrepView
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Menu
          </p>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive(to)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
