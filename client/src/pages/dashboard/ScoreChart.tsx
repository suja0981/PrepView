import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface ScoreChartProps {
  data: { date: string; score: number }[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
        <p className="text-[13px] font-medium text-foreground">No performance data yet</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">Complete interviews to see your trend.</p>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Performance trend</h3>
        <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
          {data.length} session{data.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "var(--foreground)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
              itemStyle={{ color: "var(--primary)", fontWeight: 600 }}
              labelStyle={{ color: "var(--muted-foreground)", marginBottom: "4px" }}
              formatter={(value: any) => [`${Math.round(Number(value))}%`, "Score"]}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
