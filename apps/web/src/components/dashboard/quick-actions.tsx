import Link from "next/link";
import { Search, FileText, Brain, Users } from "lucide-react";

const ACTIONS = [
  {
    href: "/dashboard/jobs",
    icon: <Search size={20} className="text-primary" />,
    label: "Find jobs near me",
    desc: "Browse live listings matched to your role",
  },
  {
    href: "/dashboard/cv",
    icon: <FileText size={20} className="text-primary" />,
    label: "Tailor my CV",
    desc: "Paste a job description, get an AI-tailored CV",
  },
  {
    href: "/dashboard/practice",
    icon: <Brain size={20} className="text-primary" />,
    label: "10-minute practice",
    desc: "Quiz, puzzle, or just chat with Clara",
  },
  {
    href: "/dashboard/community",
    icon: <Users size={20} className="text-primary" />,
    label: "Find women near me",
    desc: "Coffee chats, study buddies, and shared wins",
  },
];

interface QuickActionsProps {
  targetRole?: string | null;
}

export function QuickActions({ targetRole }: QuickActionsProps) {
  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
        What do you want to do today?
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary hover:shadow-card-hover transition-all group"
          >
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              {action.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                {action.label}
              </div>
              <div className="text-xs text-text-muted mt-0.5 font-medium">{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
