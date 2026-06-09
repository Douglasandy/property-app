import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/layout/logo";
import { MoreHorizontal } from "lucide-react";

export default function MorePage() {
  return (
    <AppShell>
      <header className="px-5 py-4">
        <Logo />
      </header>
      <main className="flex flex-col items-center justify-center px-5 pb-28 pt-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-purple-light">
          <MoreHorizontal className="size-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-navy">More</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Settings, data sources, and account options will be available here.
        </p>
      </main>
    </AppShell>
  );
}
