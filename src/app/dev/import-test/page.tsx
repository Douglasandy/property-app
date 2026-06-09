import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ImportTestPanel } from "@/components/dev/import-test-panel";

export default function ImportTestPage() {
  if (process.env.NEXT_PUBLIC_SHOW_DATA_DEBUG !== "true") {
    notFound();
  }

  return (
    <AppShell hideBottomNav>
      <main className="px-4 py-5">
        <ImportTestPanel />
      </main>
    </AppShell>
  );
}
