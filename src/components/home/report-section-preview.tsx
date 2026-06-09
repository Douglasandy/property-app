import {
  Building2,
  ChevronRight,
  GraduationCap,
  Leaf,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    icon: TrendingUp,
    title: "Value Analysis",
    description: "Compare asking price to estimated value",
  },
  {
    icon: Building2,
    title: "Planning Activity",
    description: "Nearby developments and applications",
  },
  {
    icon: GraduationCap,
    title: "Schools Nearby",
    description: "Local schools, capacity and ratings",
  },
  {
    icon: Leaf,
    title: "Environmental Risk",
    description: "Flood, air quality and radon data",
  },
  {
    icon: MapPin,
    title: "Area Outlook",
    description: "Population, demand and investment trends",
  },
  {
    icon: Star,
    title: "Final Recommendation",
    description: "Pros, cons and overall verdict",
  },
];

export function ReportSectionPreview() {
  return (
    <div className="space-y-2.5">
      {sections.map(({ icon: Icon, title, description }) => (
        <Link
          key={title}
          href="/report/123-example-road"
          className="flex items-center gap-3.5 rounded-2xl bg-card px-4 py-3.5 shadow-card transition-shadow hover:shadow-card-hover"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-purple-light">
            <Icon className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-navy">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      ))}
    </div>
  );
}
