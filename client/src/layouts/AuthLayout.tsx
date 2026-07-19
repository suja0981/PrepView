import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between border-r border-border bg-card p-8 xl:p-10">
        <div>
          <p className="text-[15px] font-semibold tracking-tight">PrepView</p>
        </div>

        <div className="space-y-4 max-w-md">
          <p className="text-[24px] xl:text-[28px] font-semibold leading-tight tracking-tight text-foreground">
            Practice interviews with AI that actually helps you improve.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Real-time voice conversations, adaptive follow-up questions, and honest performance feedback — all powered by Gemini.
          </p>
        </div>

        <p className="text-[12px] text-muted-foreground">
          © {new Date().getFullYear()} PrepView
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <p className="mb-10 text-[15px] font-semibold tracking-tight lg:hidden">PrepView</p>
        <Outlet />
      </div>
    </div>
  );
}
