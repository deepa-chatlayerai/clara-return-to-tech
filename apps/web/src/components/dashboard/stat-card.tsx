import { ReactNode } from "react";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  sub?: string;
  highlight?: boolean;
  isText?: boolean;
}

export function StatCard({ title, value, icon, sub, highlight, isText }: StatCardProps) {
  return (
    <div className={clsx("card p-5", highlight && "border-primary")}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className={clsx("font-extrabold text-text-primary", isText ? "text-lg" : "text-3xl")}>
        {value}
      </div>
      {sub && <div className="text-xs text-text-muted mt-1 font-medium">{sub}</div>}
    </div>
  );
}
