import { Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when user cancels out of the Stripe checkout page */
export default function PaymentCancel() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
      <div className="mx-auto max-w-sm text-center space-y-5">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border">
            <XCircle size={28} className="text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Payment cancelled</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            No charge was made. You can upgrade whenever you're ready.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="gap-1.5">
            <Link to="/pricing">View plans</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1">
            <Link to="/dashboard"><ArrowLeft size={13} /> Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
