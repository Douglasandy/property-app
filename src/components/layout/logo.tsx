import Link from "next/link";
import { Home } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="relative flex size-8 items-center justify-center rounded-lg bg-primary">
        <Home className="size-4 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className="text-base font-semibold tracking-tight text-navy">
        PropertyInsight{" "}
        <span className="text-primary">NI</span>
      </span>
    </Link>
  );
}
