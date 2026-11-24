import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, Trash2, Crown, Calendar, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/api/axios";

const profileSchema = z.object({ name: z.string().min(2, "Name must be at least 2 characters") });
type ProfileSchema = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordSchema = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, refetchUser } = useAuthContext();
  const navigate = useNavigate();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onUpdateProfile = async (values: ProfileSchema) => {
    try {
      await api.patch("/user/profile", values);
      await refetchUser?.();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? "Failed to update profile");
    }
  };

  const onChangePassword = async (values: PasswordSchema) => {
    try {
      await api.post("/user/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? "Failed to change password");
    }
  };

  const onDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete("/user/account");
      toast.success("Account deleted");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? "Failed to delete account");
      setDeletingAccount(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt as string).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Manage your account settings.</p>
      </motion.div>

      {/* Account Info */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
          {user?.plan === "premium" ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              <Crown size={9} /> Premium
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Free
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Calendar size={12} />
          Member since {memberSince}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User size={15} className="text-muted-foreground" />
          <h2 className="text-sm font-medium">Edit Profile</h2>
        </div>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] text-muted-foreground">Name</FormLabel>
                  <FormControl>
                    <Input className="h-9 bg-transparent text-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <p className="text-[13px] text-muted-foreground">Email</p>
              <p className="mt-1.5 text-sm text-foreground">{user?.email}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">Email cannot be changed.</p>
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="h-9 text-[13px]">
              {profileForm.formState.isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Save changes"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Change Password — only for email auth users */}
      {!(user as any)?.googleId && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-medium">Change Password</h2>
          </div>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] text-muted-foreground">Current password</FormLabel>
                    <FormControl>
                      <Input type="password" className="h-9 bg-transparent text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] text-muted-foreground">New password</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-9 bg-transparent text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] text-muted-foreground">Confirm</FormLabel>
                      <FormControl>
                        <Input type="password" className="h-9 bg-transparent text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={passwordForm.formState.isSubmitting}
                className="h-9 text-[13px]"
              >
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* OAuth info */}
      {(user as any)?.googleId && (
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-3">
          <Shield size={15} className="text-muted-foreground" />
          <div>
            <p className="text-[13px] font-medium">Signed in with Google</p>
            <p className="text-[12px] text-muted-foreground">Password management is handled by Google.</p>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Trash2 size={15} className="text-destructive" />
          <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <Button variant="destructive" size="sm" className="text-[13px]" onClick={() => setShowDeleteConfirm(true)}>
            Delete account
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="text-[13px]"
              disabled={deletingAccount}
              onClick={onDeleteAccount}
            >
              {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : "Yes, delete my account"}
            </Button>
            <Button variant="outline" size="sm" className="text-[13px]" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
