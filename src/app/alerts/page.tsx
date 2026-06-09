import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/layout/logo";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  return (
    <AppShell>
      <header className="px-5 py-4">
        <Logo />
      </header>
      <main className="flex flex-col items-center justify-center px-5 pb-28 pt-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-purple-light">
          <Bell className="size-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-navy">Alerts</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Get notified when prices change or new planning applications appear
          near your saved properties.
        </p>
      </main>
    </AppShell>
  );
}
