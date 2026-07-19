import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterviewSchema, type CreateInterviewSchema } from "@/schemas/interview.schema";
import { useCreateInterview } from "@/hooks/useInterview";

const difficulties = [
  { value: "easy", label: "Easy", desc: "Fundamentals & basics" },
  { value: "medium", label: "Medium", desc: "Industry standard" },
  { value: "hard", label: "Hard", desc: "FAANG-level" },
] as const;

const types = [
  { value: "technical", label: "Technical", desc: "Code, systems, algorithms" },
  { value: "behavioral", label: "Behavioral", desc: "Situations & soft skills" },
] as const;

export default function CreateTextInterview() {
  const navigate = useNavigate();
  const mutation = useCreateInterview();

  const form = useForm<CreateInterviewSchema>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: { role: "", company: "", techStacks: "", difficulty: "medium", type: "technical", mode: "text" },
  });

  async function onSubmit(values: CreateInterviewSchema) {
    try {
      const res = await mutation.mutateAsync({ ...values, mode: "text" });
      toast.success("Interview session created");
      navigate(`/interview/${res.data.interview._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message ?? "Failed to create interview");
    }
  }

  const selectedDifficulty = form.watch("difficulty");
  const selectedType = form.watch("type");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Back */}
      <Link to="/interview/create" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={13} /> Back to Practice hub
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground mb-3">
          <Sparkles size={11} className="text-primary" />
          Text Interview
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Configure your session</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          The AI generates adaptive questions based on your role and company. Answer at your own pace.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Role & Company */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Target</p>

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Role <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Senior Frontend Developer"
                    className="h-10 bg-background text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Company <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Google, Stripe, Razorpay"
                    className="h-10 bg-background text-sm"
                    {...field}
                  />
                </FormControl>
                <p className="text-[12px] text-muted-foreground">Questions will be tailored to this company's interview style.</p>
              </FormItem>
            )} />

            <FormField control={form.control} name="techStacks" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Tech Stacks <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. React, Node.js, AWS"
                    className="h-10 bg-background text-sm"
                    {...field}
                  />
                </FormControl>
                <p className="text-[12px] text-muted-foreground">Comma-separated technologies to focus on.</p>
              </FormItem>
            )} />
          </div>

          {/* Difficulty */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Difficulty</p>
            <FormField control={form.control} name="difficulty" render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedDifficulty === value
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border hover:border-border/60 hover:bg-secondary/50"
                      }`}
                    >
                      <span className={`text-[13px] font-semibold ${selectedDifficulty === value ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Type */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Interview Type</p>
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 gap-3">
                  {types.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-all ${
                        selectedType === value
                          ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                          : "border-border hover:border-border/60 hover:bg-secondary/50"
                      }`}
                    >
                      <span className={`text-[13px] font-semibold ${selectedType === value ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Summary + Submit */}
          <div className="rounded-xl border border-border bg-secondary/30 p-5 flex items-center justify-between gap-4">
            <div className="text-[13px] text-muted-foreground">
              <span className="text-foreground font-medium capitalize">{selectedType} · {selectedDifficulty}</span>
              {" "}· Text format · ~10 questions
            </div>
            <Button type="submit" disabled={mutation.isPending} className="shrink-0 h-9 px-5 text-[13px] font-medium">
              {mutation.isPending
                ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Generating...</>
                : "Start session →"
              }
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
