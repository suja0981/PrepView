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

import { loginSchema, type LoginSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";

export default function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginSchema) => {
    try {
      const res = await loginMutation.mutateAsync(values);
      toast.success(res.message);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message ?? error.response?.data?.message ?? "Invalid credentials");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your credentials to continue.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    className="h-9 bg-transparent text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] text-muted-foreground">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-9 bg-transparent text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-9 text-[13px] font-medium"
          >
            {loginMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        No account?{" "}
        <Link to="/register" className="text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}