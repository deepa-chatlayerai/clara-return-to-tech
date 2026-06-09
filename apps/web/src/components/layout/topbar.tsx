"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/jobs": "Job Listings",
  "/dashboard/tracker": "Applications",
  "/dashboard/cv": "CV Builder",
  "/dashboard/courses": "Courses",
  "/dashboard/skills": "Skill Gap",
  "/dashboard/practice": "Practice",
  "/dashboard/goals": "Goals",
  "/dashboard/community": "Community",
};

interface TopBarProps {
  user: {
    name?: string | null;
  };
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Clara";

  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="font-extrabold text-lg text-text-primary tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary border border-border rounded-lg px-3 py-2 transition-colors">
          <MapPin size={13} />
          Brussels, Belgium
        </button>
        <Link href="/dashboard/cv" className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5">
          <Sparkles size={13} />
          Tailor my CV
        </Link>
      </div>
    </header>
  );
}
