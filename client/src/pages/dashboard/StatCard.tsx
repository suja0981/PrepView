import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  /** Optional secondary line below the value (e.g. "82% completion rate") */
  subtext?: string;
  /** Optional accent color for the icon background */
  accent?: string;
}

export default function StatCard({ title, value, icon, subtext, accent }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="group rounded-xl border border-border bg-card p-4 sm:p-5 transition-colors hover:bg-secondary/20"
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-muted-foreground truncate pr-2">
          {title}
        </p>
        <span className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
          accent ?? "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-mono tabular-nums">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-[11px] text-muted-foreground">{subtext}</p>
      )}
    </motion.div>
  );
}