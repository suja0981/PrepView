import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList, ChevronLeft, ChevronRight, Filter,
  CheckCircle2, Clock, Circle, ArrowRight, Mic, Type
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/api/axios";

const STATUSES = ["", "pending", "in_progress", "completed"];
const TYPES = ["", "technical", "behavioral", "system_design", "mixed"];
const DIFFICULTIES = ["", "easy", "medium", "hard"];

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 size={13} className="text-green-500" />;
  if (status === "in_progress") return <Clock size={13} className="text-amber-500" />;
  return <Circle size={13} className="text-muted-foreground/40" />;
}

function statusLabel(status: string) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In Progress";
  return "Pending";
}

function difficultyColor(d: string) {
  if (d === "hard") return "text-red-500";
  if (d === "medium") return "text-amber-500";
  return "text-green-500";
}

function typeLabel(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function InterviewHistory() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (difficulty) params.set("difficulty", difficulty);

  const { data, isLoading } = useQuery({
    queryKey: ["interviews-history", page, status, type, difficulty],
    queryFn: async () => {
      const res = await api.get(`/interviews/history?${params.toString()}`);
      return res.data?.data;
    },
    placeholderData: (prev) => prev,
  });

  const interviews = data?.interviews ?? [];
  const totalPages = data?.totalPages ?? 1;

  const resetFilters = () => { setStatus(""); setType(""); setDifficulty(""); setPage(1); };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Interview History</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">All your practice sessions.</p>
        </div>
        <Link to="/interview/create"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          New Interview
        </Link>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={13} className="text-muted-foreground" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="h-8 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground focus:outline-none">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? statusLabel(s) : "All Status"}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-8 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground focus:outline-none">
          {TYPES.map((t) => <option key={t} value={t}>{t ? typeLabel(t) : "All Types"}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          className="h-8 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground focus:outline-none">
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : "All Difficulty"}</option>)}
        </select>
        {(status || type || difficulty) && (
          <button onClick={resetFilters} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : interviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <ClipboardList size={28} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No interviews found</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {status || type || difficulty ? "Try clearing your filters." : "Start your first practice session."}
            </p>
          </div>
        ) : (
          interviews.map((interview: any) => (
            <motion.div key={interview._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-secondary/30 transition-colors">
              <div className="flex-shrink-0">{statusIcon(interview.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-medium text-foreground truncate">{interview.role}</p>
                  {interview.company && (
                    <span className="text-[11px] text-muted-foreground">@ {interview.company}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    {interview.mode === "voice" ? <Mic size={10} /> : <Type size={10} />}
                    {interview.mode}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">{typeLabel(interview.type)}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className={`text-[11px] font-medium ${difficultyColor(interview.difficulty)}`}>
                    {interview.difficulty.charAt(0).toUpperCase() + interview.difficulty.slice(1)}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(interview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-muted-foreground">{interview.questionsAsked}/10 Q's</span>
                {interview.status === "completed" ? (
                  <Link to={`/interview/${interview._id}/report`}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors">
                    Report <ArrowRight size={10} />
                  </Link>
                ) : interview.status === "in_progress" ? (
                  <Link to={`/interview/${interview._id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 transition-colors">
                    Resume <ArrowRight size={10} />
                  </Link>
                ) : null}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="h-8 w-8 p-0">
            <ChevronLeft size={14} />
          </Button>
          <span className="text-[12px] text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            className="h-8 w-8 p-0">
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
