import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, ArrowUpDown, Filter, Users, Trophy, Clock, TrendingUp, MapPin, Mail, User, CheckCircle2, UserCircle, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { toast } from "sonner";
import { ContactDialog } from "@/components/ContactDialog";

const ResultsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"high-to-low" | "low-to-high">("high-to-low");
  const [quizFilter, setQuizFilter] = useState<string>("all");
  const [wilayaFilter, setWilayaFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [exportLimit, setExportLimit] = useState<"all" | "500">("all");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('adminToken');

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/get_results.php`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);


  const uniqueQuizzes = [...new Map(results.map(item => [item.quiz_id, item])).values()];

  const processedResults = (() => {
    if (quizFilter === 'all') {
      const studentMap = new Map();
      results.forEach(r => {
        if (!studentMap.has(r.student_email)) {
          studentMap.set(r.student_email, {
            ...r,
            quiz_title: { en: 'All Quizzes', fr: 'Tous les quiz', ar: 'كل الاختبارات' },
            correct_answers: 0,
            total_questions: 0,
            time_taken_seconds: 0,
            completed_at: r.completed_at,
            latest_attempt_id: r.id,
          });
        }
        const student = studentMap.get(r.student_email);
        student.correct_answers += r.correct_answers;
        student.total_questions += r.total_questions;
        student.time_taken_seconds += r.time_taken_seconds;
        if (new Date(r.completed_at) > new Date(student.completed_at)) {
          student.completed_at = r.completed_at;
          student.latest_attempt_id = r.id;
        }
      });

      const aggregated = Array.from(studentMap.values());
      aggregated.forEach(student => {
        student.score_percentage = student.total_questions > 0
          ? Math.round((student.correct_answers / student.total_questions) * 100)
          : 0;
      });
      return aggregated;
    }
    return results;
  })();

  const filteredResults = processedResults
    .filter((r: any) => {
      const searchMatch =
        r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quizFilter !== 'all' && r.quiz_title[currentLang].toLowerCase().includes(searchQuery.toLowerCase()));
      const quizMatch = quizFilter === 'all' || r.quiz_id === quizFilter;
      const wilayaMatch = wilayaFilter === 'all' || (r.student_wilaya && r.student_wilaya === wilayaFilter);
      return searchMatch && quizMatch && wilayaMatch;
    })
    .sort((a: any, b: any) => {
      if (sortOrder === "high-to-low") {
        // If scores are different, sort by score (descending)
        if (b.score_percentage !== a.score_percentage) {
          return b.score_percentage - a.score_percentage;
        }
        // If scores are same, sort by time taken (ascending - faster is better)
        return a.time_taken_seconds - b.time_taken_seconds;
      }
      // Low to high (reverse)
      if (a.score_percentage !== b.score_percentage) {
        return a.score_percentage - b.score_percentage;
      }
      return b.time_taken_seconds - a.time_taken_seconds;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSeeAll = () => {
    setItemsPerPage(filteredResults.length > 0 ? filteredResults.length : 20);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    let dataToExport = filteredResults;

    if (exportLimit === "500") {
      dataToExport = filteredResults.slice(0, 500);
    }

    const headers = ["Student Name", "Email", "Phone", "Wilaya", "Quiz Name", "Score", "Time Taken", "Date"];
    const rows = dataToExport.map((r: any) => [
      r.student_name,
      r.student_email,
      r.student_phone,
      r.student_wilaya || '-',
      r.quiz_title[currentLang],
      `${r.correct_answers}/${r.total_questions} (${r.score_percentage}% )`,
      `${r.time_taken_seconds}s`,
      new Date(r.completed_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-results-${exportLimit === 'all' ? 'full' : 'top-500'}.csv`;
    a.click();
    toast.success(t("common.success"));
  };

  // Calculate summary stats
  const totalStudents = new Set(filteredResults.map(r => r.student_email)).size;
  const averageScore = filteredResults.length > 0
    ? Math.round(filteredResults.reduce((sum, r) => sum + r.score_percentage, 0) / filteredResults.length)
    : 0;
  const topScore = filteredResults.length > 0
    ? Math.max(...filteredResults.map(r => r.score_percentage))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-3 mb-6"
      >
        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t("admin.total_results")}</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {filteredResults.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t("admin.total_students")}</p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {totalStudents}
                </h3>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Top Score</p>
                <h3 className="text-3xl font-bold text-yellow-600">
                  {topScore}%
                </h3>
              </div>
              <div className="p-3 bg-yellow-500 rounded-xl shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Results Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-30"></div>
          <CardHeader className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                <Filter className="h-6 w-6 text-indigo-600" />
                {t("admin.results")}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select value={quizFilter} onValueChange={setQuizFilter}>
                  <SelectTrigger className="w-[180px] border-2 hover:border-indigo-300 transition-colors">
                    <SelectValue placeholder={t("admin.filter_by_quiz")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin.all_quizzes")}</SelectItem>
                    {uniqueQuizzes.map((quiz: any) => (
                      <SelectItem key={quiz.quiz_id} value={quiz.quiz_id}>
                        {quiz.quiz_title[currentLang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                  <SelectTrigger className="w-[180px] border-2 hover:border-purple-300 transition-colors">
                    <SelectValue placeholder="Filter by Wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wilayas</SelectItem>
                    <SelectItem value="Alger">Alger</SelectItem>
                    <SelectItem value="Oran">Oran</SelectItem>
                    <SelectItem value="Constantine">Constantine</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "high-to-low" ? "low-to-high" : "high-to-low")}
                  className="gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === "high-to-low" ? t("admin.high_to_low") : t("admin.low_to_high")}
                </Button>



                <div className="flex items-center gap-2 bg-white rounded-md border shadow-sm">
                  <Select value={exportLimit} onValueChange={(val: "all" | "500") => setExportLimit(val)}>
                    <SelectTrigger className="w-[130px] border-0 focus:ring-0">
                      <SelectValue placeholder="Export Limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Export All</SelectItem>
                      <SelectItem value="500">Top 500</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={exportToCSV}
                    size="sm"
                    className="h-9 rounded-l-none bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t("admin.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-2 focus:border-indigo-300 rounded-xl shadow-sm"
              />
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="rounded-xl border-2 border-gray-100 overflow-hidden shadow-inner">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50 hover:bg-indigo-100">
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("admin.student_name")}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {t("admin.email")}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Wilaya
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {t("admin.account_type")}
                      </div>
                    </TableHead>
                    {quizFilter !== 'all' && (
                      <TableHead className="font-semibold text-gray-700">{t("admin.quiz_name")}</TableHead>
                    )}
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        {t("admin.score")}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t("admin.time_taken")}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">{t("admin.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 font-medium">{t("common.loading")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-red-600 font-semibold">{t("common.error")}: {error}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">{t("admin.no_results")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedResults.map((result: any, index: number) => (
                      <TableRow
                        key={result.id}
                        className="cursor-pointer hover:bg-indigo-50 transition-all border-b border-gray-100"
                      >
                        <TableCell>
                          <Link
                            to={`/admin/results/${result.latest_attempt_id || result.id}`}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors flex items-center gap-2"
                          >
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {result.student_name.charAt(0).toUpperCase()}
                            </div>
                            {result.student_name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {result.student_email || '-'}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <MapPin className="h-3 w-3" />
                            {result.student_wilaya || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${result.has_account
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white'
                            }`}>
                            {result.has_account ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                {t('admin.registered')}
                              </>
                            ) : (
                              <>
                                <UserCircle className="h-3 w-3" />
                                {t('admin.guest')}
                              </>
                            )}
                          </span>
                        </TableCell>
                        {quizFilter !== 'all' && (
                          <TableCell className="text-sm font-medium text-gray-700">
                            {result.quiz_title[currentLang]}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{result.correct_answers}/{result.total_questions}</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${result.score_percentage >= 80 ? 'bg-green-100 text-green-700' :
                              result.score_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                                result.score_percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {result.score_percentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                            <Clock className="h-3 w-3" />
                            {result.time_taken_seconds}s
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(result.completed_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeeAll()}
                    disabled={itemsPerPage >= filteredResults.length}
                    className="mr-2"
                  >
                    See All
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div >
  );
};

export default ResultsPage;