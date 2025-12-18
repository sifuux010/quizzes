import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, Crown, Calendar, Award, Target, Sparkles } from "lucide-react";
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
        const token = localStorage.getItem('adminToken');

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/get_dashboard_stats.php`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

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

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{t('common.loading')}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error')}</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

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
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: t("admin.total_attempts"),
      value: stats.total_attempts,
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: t("admin.avg_score"),
      value: `${Math.round(stats.average_score)}%`,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* Header with floating elements */}
      <div className="mb-8 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-2xl"></div>
        </motion.div>
      </div>

      {/* Stats Grid with enhanced cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {summaryStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden group relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-3 group-hover:text-gray-700 transition-colors">{stat.title}</p>
                    <h3 className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2" style={{
                      backgroundImage: `linear-gradient(to right, ${stat.gradient.split(' ')[0].replace('from-', '')}, ${stat.gradient.split(' ')[1].replace('to-', '')})`
                    }}>{stat.value}</h3>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Performance Chart - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-0"></div>
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  {t("admin.performance_chart")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)",
                        padding: "12px",
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

        {/* Circular Progress - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-white h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 rounded-full blur-3xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                {t("admin.performance_distribution")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center relative z-10">
              <div className="relative w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full"></div>
                <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="20" fill="none" />
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
                        className="transition-all duration-1000 drop-shadow-lg"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-6 shadow-inner">
                  <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{excellentPercentage.toFixed(0)}%</span>
                  <span className="text-xs text-gray-500 mt-1 font-medium">{t('admin.excellent')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                {levelData.map((lvl) => (
                  <div key={lvl.name} className="flex items-center justify-between bg-gradient-to-br from-gray-50 to-white rounded-xl px-4 py-3 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                    <span className="text-xs text-gray-600 font-medium">{lvl.name}</span>
                    <span className="text-sm font-bold px-2 py-1 rounded-lg" style={{
                      color: lvl.color,
                      backgroundColor: `${lvl.color}15`
                    }}>{lvl.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quiz Distribution - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-white overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600" />
                  {t("admin.quiz_distribution")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-md">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{t("admin.total_attempts")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total_attempts}</span>
                  </div>
                </div>
                <div className="h-[200px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.2)",
                          padding: "12px",
                        }}
                      />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-100/50 to-orange-100/50 rounded-full blur-3xl"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                <Crown className="h-6 w-6 text-yellow-500" />
                {t("admin.leaderboard") || "Top Performers"}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {stats.top_students.slice(0, 5).map((student: any, index: number) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300 border border-transparent hover:border-indigo-100 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' :
                              'bg-gradient-to-br from-indigo-400 to-purple-500 text-white'
                        }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{stats.total_attempts} attempts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{Math.round(student.avg_score || 0)}%</p>
                    </div>
                  </motion.div>
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