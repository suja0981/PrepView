import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
      >
        <ArrowLeft size={13} />
        Go home
      </Link>
    </div>
  );
}
