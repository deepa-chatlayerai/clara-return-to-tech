import { formatDistanceToNow } from "date-fns";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: Date;
}

export function StreakCard({ currentStreak, longestStreak, lastActiveAt }: StreakCardProps) {
  const lastSeen = formatDistanceToNow(new Date(lastActiveAt), { addSuffix: true });

  return (
    <div className="card p-5">
      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
        Activity Streak
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
          <span className="text-2xl font-extrabold text-primary">{currentStreak}</span>
        </div>
        <div>
          <div className="text-lg font-extrabold text-text-primary">
            {currentStreak} {currentStreak === 1 ? "day" : "days"} active
          </div>
          <div className="text-xs text-text-muted font-medium">
            Personal best: {longestStreak} days
          </div>
        </div>
      </div>
      <div className="text-xs text-text-muted font-medium">
        Last active {lastSeen}
      </div>
      {currentStreak === 0 && (
        <div className="mt-3 text-xs bg-primary-50 text-primary rounded-lg px-3 py-2 font-medium">
          Life gets busy — welcome back. Start a new streak today.
        </div>
      )}
    </div>
  );
}
