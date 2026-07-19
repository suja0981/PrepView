import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function LandingNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-[15px] font-semibold tracking-tight text-foreground">
          PrepView
        </Link>

        <div className="flex items-center gap-2">
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
