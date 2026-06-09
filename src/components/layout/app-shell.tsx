import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

export function AppShell({ children, hideBottomNav }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto min-h-dvh w-full max-w-lg lg:max-w-2xl xl:max-w-4xl">
        {children}
      </div>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
