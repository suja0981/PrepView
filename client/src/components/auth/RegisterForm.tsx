import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { registerSchema, type RegisterSchema } from "@/schemas/auth.schema";
import { useRegister } from "@/hooks/useAuth";

export default function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterSchema) => {
    try {
      const { confirmPassword, ...payload } = values;
      const res = await registerMutation.mutateAsync(payload);
      toast.success(res.message ?? "Account created");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message ?? error.response?.data?.message ?? "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Get started with your interview practice.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" className="h-9 bg-transparent text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" autoComplete="email" className="h-9 bg-transparent text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-muted-foreground">Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" className="h-9 bg-transparent text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-muted-foreground">Confirm</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" autoComplete="new-password" className="h-9 bg-transparent text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={registerMutation.isPending} className="w-full h-9 text-[13px] font-medium">
            {registerMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}