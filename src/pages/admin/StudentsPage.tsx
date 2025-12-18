import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, Users, GraduationCap, Trophy, Clock, UserCircle, CheckCircle2, Mail, Award, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ContactDialog } from "@/components/ContactDialog";

const StudentsPage = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quizFilter, setQuizFilter] = useState<string>("all");
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/backend/api/get_quizzes.php`);
        const data = await response.json();
        setAvailableQuizzes(data);
      } catch (error) {
        console.error("Failed to fetch quizzes for filter");
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const url = `${import.meta.env.VITE_API_BASE_URL}/backend/api/get_students.php?quiz_id=${quizFilter}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [quizFilter]);

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setContactDialogOpen(true);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredStudents = students
    .filter((student: any) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const key = sortConfig.key;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      const valA = a[key] || 0;
      const valB = b[key] || 0;

      if (key === 'avg_score') {
        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        const attemptsA = a['attempts_count'] || 0;
        const attemptsB = b['attempts_count'] || 0;
        if (attemptsA < attemptsB) return -1 * direction;
        if (attemptsA > attemptsB) return 1 * direction;
        return 0;
      }

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;

    });

  // Pagination Logic
  const totalPages = Math.ceil(sortedAndFilteredStudents.length / itemsPerPage);
  const paginatedStudents = sortedAndFilteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSeeAll = () => {
    setItemsPerPage(sortedAndFilteredStudents.length > 0 ? sortedAndFilteredStudents.length : 20);
    setCurrentPage(1);
  };

  // Calculate summary stats
  const totalStudents = sortedAndFilteredStudents.length;
  const registeredStudents = sortedAndFilteredStudents.filter(s => s.has_account).length;
  const totalAttempts = sortedAndFilteredStudents.reduce((sum, s) => sum + (s.attempts_count || 0), 0);
  const avgScore = totalStudents > 0
    ? Math.round(sortedAndFilteredStudents.reduce((sum, s) => sum + (s.avg_score || 0), 0) / totalStudents)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-4 mb-6"
      >
        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t("admin.total_students")}</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {totalStudents}
                </h3>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t("admin.registered")}</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {registeredStudents}
                </h3>
              </div>
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Attempts</p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {totalAttempts}
                </h3>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white overflow-hidden relative group hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{t("admin.avg_score")}</p>
                <h3 className="text-3xl font-bold text-orange-600">
                  {avgScore}%
                </h3>
              </div>
              <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Students Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl bg-white overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-30"></div>
          <CardHeader className="space-y-6 relative z-10">
            <CardTitle className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
              <Filter className="h-6 w-6 text-indigo-600" />
              {t("admin.students")}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("admin.search_students")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 focus:border-indigo-300 rounded-xl shadow-sm"
                />
              </div>
              <Select value={quizFilter} onValueChange={setQuizFilter}>
                <SelectTrigger className="w-full sm:w-[200px] border-2 hover:border-indigo-300 transition-colors h-12 rounded-xl">
                  <SelectValue placeholder={t("admin.filter_by_quiz")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.all_quizzes")}</SelectItem>
                  {availableQuizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title[currentLang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="rounded-xl border-2 border-gray-100 overflow-hidden shadow-inner">
              <Table>
                <TableHeader>
                  <TableRow className="bg-indigo-50 hover:bg-indigo-100">
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('name')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <UserCircle className="mr-2 h-4 w-4" />
                        {t("admin.student_name")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('email')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <Mail className="mr-2 h-4 w-4" />
                        {t("admin.email")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('has_account')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t("admin.account_type")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('attempts_count')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {t("admin.total_quizzes")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('total_correct_answers')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <Award className="mr-2 h-4 w-4" />
                        {t("admin.total_correct")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('avg_score')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <Trophy className="mr-2 h-4 w-4" />
                        {t("admin.avg_score")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => requestSort('last_attempt')} className="font-semibold text-gray-700 hover:text-indigo-600">
                        <Clock className="mr-2 h-4 w-4" />
                        {t("admin.last_attempt")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 font-medium">{t("common.loading")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
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
                  ) : sortedAndFilteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">{t("admin.no_students")}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student: any, index: number) => (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-indigo-50 transition-all border-b border-gray-100">
                        <TableCell>
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-2 transition-colors"
                          >
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            {student.name}
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {student.email || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${student.has_account
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white'
                            }`}>
                            {student.has_account ? (
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
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm">
                            {student.attempts_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                            <Award className="h-3 w-3" />
                            {student.total_correct_answers || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${(student.avg_score || 0) >= 80 ? 'bg-green-500' :
                                  (student.avg_score || 0) >= 60 ? 'bg-blue-500' :
                                    (student.avg_score || 0) >= 40 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                  }`}
                                style={{ width: `${Math.round(student.avg_score || 0)}%` }}
                              />
                            </div>
                            <span className={`font-bold text-sm px-2 py-1 rounded-lg ${(student.avg_score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                              (student.avg_score || 0) >= 60 ? 'bg-blue-100 text-blue-700' :
                                (student.avg_score || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                              {Math.round(student.avg_score || 0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {student.last_attempt ? new Date(student.last_attempt).toLocaleDateString() : '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {sortedAndFilteredStudents.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAndFilteredStudents.length)} of {sortedAndFilteredStudents.length} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeeAll()}
                    disabled={itemsPerPage >= sortedAndFilteredStudents.length}
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

      {selectedStudent && (
        <ContactDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default StudentsPage;