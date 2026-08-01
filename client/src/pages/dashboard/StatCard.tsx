import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  // Optional secondary line below the value (e.g. "82% completion rate")
  subtext?: string;
}

export default function StatCard({ title, value, icon, subtext }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-muted-foreground truncate pr-2">
          {title}
        </p>
        <span className="shrink-0 text-muted-foreground">{icon}</span>
      </div>
      <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-[11px] text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}