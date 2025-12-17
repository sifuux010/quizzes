import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
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
        const url = `${import.meta.env.VITE_API_BASE_URL}/backend/api/get_students.php?quiz_id=${quizFilter}`;
        const response = await fetch(url);
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
        // Professional sorting: if average scores are equal, rank by attempts
        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
        // Secondary sort for avg_score
        const attemptsA = a['attempts_count'] || 0;
        const attemptsB = b['attempts_count'] || 0;
        if (attemptsA < attemptsB) return -1 * direction;
        if (attemptsA > attemptsB) return 1 * direction;
        return 0;
      }

      // Default sort for other columns
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2">
        <CardHeader className="space-y-4">
          <CardTitle>{t("admin.students")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.search_students")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={quizFilter} onValueChange={setQuizFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')}>
                      {t("admin.student_name")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('email')}>
                      {t("admin.email")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('has_account')}>
                      {t("admin.account_type")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('attempts_count')}>
                      {t("admin.total_quizzes")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('total_correct_answers')}>
                      {t("admin.total_correct")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('avg_score')}>
                      {t("admin.avg_score")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('last_attempt')}>
                      {t("admin.last_attempt")}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("common.loading")}</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive">{t("common.error")}: {error}</TableCell>
                  </TableRow>
                ) : sortedAndFilteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("admin.no_students")}</TableCell>
                  </TableRow>
                ) : (
                  sortedAndFilteredStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="font-medium text-primary hover:underline cursor-pointer"
                        >
                          {student.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.email || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.has_account
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                          {student.has_account ? t('admin.registered') : t('admin.guest')}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{student.attempts_count}</TableCell>
                      <TableCell className="text-center font-semibold">{student.total_correct_answers || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${Math.round(student.avg_score || 0)}%` }}
                            />
                          </div>
                          <span className="font-semibold">{Math.round(student.avg_score || 0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.last_attempt ? new Date(student.last_attempt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <ContactDialog
          open={contactDialogOpen}
          onOpenChange={setContactDialogOpen}
          student={selectedStudent}
        />
      )}
    </motion.div>
  );
};

export default StudentsPage;
