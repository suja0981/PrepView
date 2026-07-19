import type { RecentInterview } from "@/types/dashboard";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

interface Props {
  interviews: RecentInterview[];
}

const statusLabel: Record<string, { text: string; className: string }> = {
  completed: { text: "Completed", className: "text-emerald-400 bg-emerald-500/10" },
  pending: { text: "Pending", className: "text-yellow-400 bg-yellow-500/10" },
  in_progress: { text: "In Progress", className: "text-blue-400 bg-blue-500/10" },
};

export default function RecentInterviews({ interviews }: Props) {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-12 text-center">
        <p className="text-sm text-muted-foreground">No interviews yet.</p>
        <p className="mt-1 text-[12px] text-muted-foreground/60">
          Create your first one to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] sm:text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-4 sm:px-5 py-3 text-left">Role</th>
            <th className="px-4 sm:px-5 py-3 text-left hidden sm:table-cell">Difficulty</th>
            <th className="px-4 sm:px-5 py-3 text-left">Status</th>
            <th className="px-4 sm:px-5 py-3 w-8 sm:w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {interviews.map((interview) => {
            const s = statusLabel[interview.status] ?? statusLabel.pending;
            const href =
              interview.status === "completed"
                ? `/interview/${interview._id}/report`
                : `/interview/${interview._id}`;

            return (
              <tr key={interview._id} className="group transition-colors hover:bg-secondary/50">
                <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                  <div>
                    <p className="font-medium text-foreground capitalize text-[13px] sm:text-sm leading-tight">
                      {interview.role}
                    </p>
                    {interview.company && (
                      <p className="text-[11px] text-muted-foreground hidden sm:block">
                        {interview.company}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-5 py-3 sm:py-3.5 capitalize text-muted-foreground text-[13px] hidden sm:table-cell">
                  {interview.difficulty}
                </td>
                <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
                    {s.text}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                  <Link
                    to={href}
                    className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

  );
}