import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useDashboardStats,
  useStudents,
  useTeachers,
} from "../hooks/useQueries";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

interface StatCardProps {
  label: string;
  sublabel: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  delay?: number;
}

function StatCard({
  label,
  sublabel,
  value,
  icon: Icon,
  colorClass,
}: StatCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Card className={`card-hover overflow-hidden border-l-4 ${colorClass}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                {label}
              </p>
              <p className="text-xs text-muted-foreground/70 mb-2">
                {sublabel}
              </p>
              <p className="text-3xl font-display font-bold text-foreground">
                {value}
              </p>
            </div>
            <div
              className={`p-3 rounded-xl ${colorClass.replace("border-l-4 border-", "bg-").replace("-500", "-100")}`}
            >
              <Icon
                className={`h-6 w-6 ${colorClass.replace("border-l-4 border-", "text-").replace("-100", "-600")}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="border-l-4 border-l-border overflow-hidden">
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: students } = useStudents();
  const { data: teachers } = useTeachers();

  const totalStudents = stats
    ? Number(stats.totalStudents)
    : (students?.length ?? 0);
  const totalTeachers = stats
    ? Number(stats.totalTeachers)
    : (teachers?.length ?? 0);
  const todayPresent = stats ? Number(stats.todayPresentCount) : 0;
  const todayAbsent = stats ? Number(stats.todayAbsentCount) : 0;
  const todayLate = stats ? Number(stats.todayLateCount) : 0;

  const attendanceRate =
    totalStudents > 0 ? Math.round((todayPresent / totalStudents) * 100) : 0;

  const statsCards = [
    {
      label: "कुल छात्र",
      sublabel: "Total Students",
      value: totalStudents,
      icon: Users,
      colorClass: "border-l-blue-500",
    },
    {
      label: "कुल शिक्षक",
      sublabel: "Total Teachers",
      value: totalTeachers,
      icon: GraduationCap,
      colorClass: "border-l-purple-500",
    },
    {
      label: "आज उपस्थित",
      sublabel: "Today Present",
      value: todayPresent,
      icon: CheckCircle2,
      colorClass: "border-l-green-500",
    },
    {
      label: "आज अनुपस्थित",
      sublabel: "Today Absent",
      value: todayAbsent,
      icon: XCircle,
      colorClass: "border-l-red-500",
    },
    {
      label: "आज देर से",
      sublabel: "Today Late",
      value: todayLate,
      icon: Clock,
      colorClass: "border-l-amber-500",
    },
    {
      label: "उपस्थिति दर",
      sublabel: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      colorClass: "border-l-teal-500",
    },
  ];

  // Recent students / teachers for info sections
  const recentStudents = students?.slice(0, 5) ?? [];
  const recentTeachers = teachers?.slice(0, 5) ?? [];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          डैशबोर्ड
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          आज का सारांश —{" "}
          {new Date().toLocaleDateString("hi-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="dashboard.loading_state"
        >
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <StatCardSkeleton key={k} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {statsCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </motion.div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-base text-foreground">
                    हाल के छात्र
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Recent Students
                  </p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              {recentStudents.length === 0 ? (
                <div
                  className="px-5 py-8 text-center text-muted-foreground text-sm"
                  data-ocid="dashboard.students.empty_state"
                >
                  कोई छात्र नहीं जोड़ा गया
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentStudents.map((s, i) => (
                    <div
                      key={s.id.toString()}
                      className="px-5 py-3 flex items-center justify-between"
                      data-ocid={`dashboard.students.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Roll: {s.rollNumber}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {s.grade}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Teachers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-base text-foreground">
                    शिक्षक सूची
                  </h2>
                  <p className="text-xs text-muted-foreground">Teachers List</p>
                </div>
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
              </div>
              {recentTeachers.length === 0 ? (
                <div
                  className="px-5 py-8 text-center text-muted-foreground text-sm"
                  data-ocid="dashboard.teachers.empty_state"
                >
                  कोई शिक्षक नहीं जोड़ा गया
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentTeachers.map((t, i) => (
                    <div
                      key={t.id.toString()}
                      className="px-5 py-3 flex items-center justify-between"
                      data-ocid={`dashboard.teachers.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">
                            {t.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {t.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {t.employeeId}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-50 text-purple-700">
                        {t.subject}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
