import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mic, Type } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterviewSchema, type CreateInterviewSchema } from "@/schemas/interview.schema";
import { useCreateInterview } from "@/hooks/useInterview";

const difficulties = ["easy", "medium", "hard"] as const;
const types = ["technical", "behavioral"] as const;
const modes = [
  { value: "voice", label: "Voice", icon: Mic, desc: "Speak your answers aloud" },
  { value: "text", label: "Text", icon: Type, desc: "Type your answers" },
] as const;

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md border px-3 py-2 text-[13px] font-medium capitalize transition-colors ${
            value === o.value
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function CreateInterviewForm() {
  const navigate = useNavigate();
  const mutation = useCreateInterview();

  const form = useForm<CreateInterviewSchema>({
    resolver: zodResolver(createInterviewSchema),
    defaultValues: { role: "", company: "", difficulty: "medium", type: "technical", mode: "voice" },
  });

  async function onSubmit(values: CreateInterviewSchema) {
    try {
      const res = await mutation.mutateAsync(values);
      toast.success("Interview created");
      navigate(`/interview/${res.data.interview._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message ?? "Failed to create interview");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New interview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your session. The AI tailors questions to your inputs.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Role */}
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">
                  Role <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Frontend Developer" className="h-9 bg-transparent text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Company */}
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Company</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Google (optional)" className="h-9 bg-transparent text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Difficulty */}
            <FormField control={form.control} name="difficulty" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Difficulty</FormLabel>
                <ToggleGroup options={difficulties.map(d => ({ value: d, label: d }))} value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />

            {/* Type */}
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Type</FormLabel>
                <ToggleGroup options={types.map(t => ({ value: t, label: t }))} value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )} />

            {/* Mode */}
            <FormField control={form.control} name="mode" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Format</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {modes.map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex flex-col items-start gap-1 rounded-md border px-3 py-3 text-left transition-colors ${
                        field.value === value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon size={13} />
                        <span className="text-[13px] font-medium">{label}</span>
                      </div>
                      <span className="text-[11px] opacity-70">{desc}</span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" disabled={mutation.isPending} className="w-full h-9 text-[13px] font-medium">
              {mutation.isPending ? (
                <><Loader2 size={14} className="mr-1.5 animate-spin" /> Generating...</>
              ) : "Start interview"}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  );
}