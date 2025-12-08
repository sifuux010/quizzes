import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, Crown, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/get_dashboard_stats.php');
        console.log('[Dashboard] GET /get_dashboard_stats.php status', response.status, response.headers.get('content-type'));
        const raw = await response.clone().text();
        console.log('[Dashboard] raw response (first 500 chars):', raw.slice(0, 500));
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        let data: any;
        try {
          data = await response.json();
        } catch (parseErr) {
          console.error('[Dashboard] JSON parse error:', parseErr);
          throw new Error('Invalid JSON received from get_dashboard_stats.php');
        }
        setStats(data);
      } catch (err: any) {
        console.error('[Dashboard] fetchStats error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <div className="text-center p-8">{t('common.loading')}</div>;
  if (error) return <div className="text-center p-8 text-destructive">{t('common.error')}: {error}</div>;
  if (!stats) return null;

  // --- Process data for charts ---
  const performanceData = stats.recent_performance.map((r: any, index: number) => ({
    name: r.title[currentLang] || `Quiz ${index + 1}`,
    score: parseFloat(r.score_percentage),
    date: new Date(r.completed_at).toLocaleDateString(),
  })).reverse();

  const distributionData = stats.quiz_distribution.map((d: any) => ({
    name: d.title[currentLang],
    value: parseInt(d.attempt_count, 10),
  }));

  const levelData = [
    { name: t("admin.excellent"), value: stats.performance_levels.excellent, color: "#10b981" },
    { name: t("admin.good"), value: stats.performance_levels.good, color: "#3b82f6" },
    { name: t("admin.average"), value: stats.performance_levels.average, color: "#f59e0b" },
    { name: t("admin.needs_work"), value: stats.performance_levels.needs_improvement, color: "#ef4444" },
  ];

  // Calculate percentage for circular progress (Excellent share)
  const totalPerformance = levelData.reduce((acc, curr) => acc + curr.value, 0);
  const excellentPercentage = totalPerformance > 0 ? (stats.performance_levels.excellent / totalPerformance) * 100 : 0;
  let cumulativePercentage = 0;

  const summaryStats = [
    {
      title: t("admin.total_students"),
      value: stats.total_students,
      icon: Users,
      color: "#6366f1",
      bgColor: "bg-indigo-50",
    },
    {
      title: t("admin.total_attempts"),
      value: stats.total_attempts,
      icon: FileText,
      color: "#6366f1",
      bgColor: "bg-indigo-50",
    },
    {
      title: t("admin.avg_score"),
      value: `${Math.round(stats.average_score)}%`,
      icon: TrendingUp,
      color: "#6366f1",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
     

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                    {/* No change indicators shown: backend doesn't provide trend deltas */}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Performance Chart - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t("admin.performance_chart")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#f0f0f0' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#f0f0f0' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#colorScore)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Circular Progress - Takes 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm bg-white h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t("admin.performance_distribution")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="80" stroke="#e5e7eb" strokeWidth="20" fill="none" />
                  {levelData.map((lvl) => {
                    const percentage = totalPerformance > 0 ? (lvl.value / totalPerformance) * 100 : 0;
                    const offset = (cumulativePercentage / 100) * 502.4;
                    cumulativePercentage += percentage;
                    return (
                      <circle
                        key={lvl.name}
                        cx="96"
                        cy="96"
                        r="80"
                        stroke={lvl.color}
                        strokeWidth="20"
                        fill="none"
                        strokeDasharray={`${(percentage / 100) * 502.4} 502.4`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{excellentPercentage.toFixed(0)}%</span>
                  <span className="text-sm text-gray-500">{t('admin.excellent')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {levelData.map((lvl) => (
                  <div key={lvl.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">{lvl.name}</span>
                    <span className="text-sm font-semibold" style={{ color: lvl.color }}>{lvl.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Online Store Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t("admin.quiz_distribution")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-600">{t("admin.total_attempts")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{stats.total_attempts}</span>
                  </div>
                </div>
                <div className="h-[200px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Crown className="h-5 w-5 text-yellow-500" />
                {t("admin.leaderboard") || "Top Performers"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.top_students.slice(0, 5).map((student: any, index: number) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{stats.total_attempts} attempts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">{Math.round(student.avg_score || 0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;