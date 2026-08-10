import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function LandingNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            P
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            PrepView
          </span>
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-muted-foreground">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <Link
            to="/login"
            className="px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>

          <Link
            to="/register"
            className="px-3 py-1.5 rounded-md bg-primary text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
