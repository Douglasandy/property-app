import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/layout/logo";
import { SavedPageContent } from "@/components/saved/saved-page-content";

export default function SavedPage() {
  return (
    <AppShell>
      <header className="sticky top-0 z-40 bg-surface/95 px-5 py-4 backdrop-blur-md">
        <Logo />
      </header>
      <SavedPageContent />
    </AppShell>
  );
}
