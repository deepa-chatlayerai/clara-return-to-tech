import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { StreakCard } from "@/components/dashboard/streak-card";
import { MotivationBanner } from "@/components/dashboard/motivation-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { BriefcaseIcon, GraduationCap, TrendingUp, CalendarCheck } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id as string;
  const firstName = session!.user?.name?.split(" ")[0] || "there";

  const [profile, streak, applications, userCourses] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.jobApplication.findMany({ where: { userId } }),
    prisma.userCourse.findMany({ where: { userId } }),
  ]);

  const appliedCount = applications.filter((a) => a.status !== "SAVED").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW").length;
  const coursesInProgress = userCourses.filter(
    (c) => c.progressPct > 0 && c.progressPct < 100
  ).length;
  const coursesCompleted = userCourses.filter((c) => c.progressPct === 100).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <MotivationBanner
        firstName={firstName}
        targetRole={profile?.targetRole}
        streak={streak?.currentStreak || 0}
        appliedThisWeek={appliedCount}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jobs Applied"
          value={appliedCount}
          icon={<BriefcaseIcon size={18} className="text-primary" />}
          sub={`${applications.filter((a) => a.status === "SAVED").length} saved`}
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          icon={<CalendarCheck size={18} className="text-accent" />}
          sub={interviewCount > 0 ? "Check your tracker" : "Keep applying"}
          highlight={interviewCount > 0}
        />
        <StatCard
          title="Courses Done"
          value={coursesCompleted}
          icon={<GraduationCap size={18} className="text-success" />}
          sub={`${coursesInProgress} in progress`}
        />
        <StatCard
          title="Profile Match"
          value={`${profile?.targetRole ? "—" : "Set your role"}`}
          icon={<TrendingUp size={18} className="text-primary" />}
          sub="AI analysis"
          isText
        />
      </div>

      {/* Quick actions + streak */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions targetRole={profile?.targetRole} />
        </div>
        <StreakCard
          currentStreak={streak?.currentStreak || 0}
          longestStreak={streak?.longestStreak || 0}
          lastActiveAt={streak?.lastActiveAt || new Date()}
        />
      </div>
    </div>
  );
}
