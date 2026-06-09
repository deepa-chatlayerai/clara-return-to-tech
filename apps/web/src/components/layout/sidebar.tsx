"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  FileText,
  BookOpen,
  BarChart2,
  Brain,
  Target,
  Users,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";

const NAV = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Job Hunt",
    items: [
      { href: "/dashboard/jobs", label: "Job Listings", icon: Search },
      { href: "/dashboard/tracker", label: "Applications", icon: ClipboardList },
      { href: "/dashboard/cv", label: "CV Builder", icon: FileText },
    ],
  },
  {
    section: "Upskill",
    items: [
      { href: "/dashboard/courses", label: "Courses", icon: BookOpen },
      { href: "/dashboard/skills", label: "Skill Gap", icon: BarChart2 },
      { href: "/dashboard/practice", label: "Practice", icon: Brain },
    ],
  },
  {
    section: "You",
    items: [
      { href: "/dashboard/goals", label: "Goals", icon: Target },
      { href: "/dashboard/community", label: "Community", icon: Users },
    ],
  },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const firstName = user.name?.split(" ")[0] || "You";
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  return (
    <aside className="w-60 bg-[#1C1917] text-white flex flex-col fixed h-full z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-xl font-extrabold tracking-tight text-white">Clara</div>
        <div className="text-[11px] text-white/40 mt-0.5 font-medium">your return to tech</div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{firstName}</div>
          <div className="text-[11px] text-white/40 truncate">{user.email}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-5">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {group.section}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={17} strokeWidth={active ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 w-full font-medium transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
