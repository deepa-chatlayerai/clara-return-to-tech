interface MotivationBannerProps {
  firstName: string;
  targetRole?: string | null;
  streak: number;
  appliedThisWeek: number;
}

export function MotivationBanner({
  firstName,
  targetRole,
  streak,
  appliedThisWeek,
}: MotivationBannerProps) {
  return (
    <div className="rounded-xl bg-primary p-6 text-white flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">
          Welcome back, {firstName}
        </h2>
        <p className="text-white/70 text-sm font-medium">
          {appliedThisWeek > 0
            ? `${appliedThisWeek} application${appliedThisWeek > 1 ? "s" : ""} sent this week. Keep the momentum going.`
            : "Every day you show up is progress. Start with one small action."}
        </p>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {targetRole && (
            <div className="bg-white/15 rounded-lg px-3 py-1.5 text-xs font-semibold">
              Target: {targetRole}
            </div>
          )}
        </div>
      </div>
      {streak > 0 && (
        <div className="flex-shrink-0 bg-white/15 rounded-xl px-5 py-3 text-center">
          <div className="text-3xl font-extrabold">{streak}</div>
          <div className="text-[11px] text-white/70 font-medium">day streak</div>
        </div>
      )}
    </div>
  );
}
