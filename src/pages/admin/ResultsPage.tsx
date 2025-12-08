import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, ArrowUpDown } from "lucide-react";
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
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/get_results.php');
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
            completed_at: r.completed_at, // Keep the latest attempt date
            id: r.student_email, // Use email as a unique key for aggregated view
          });
        }
        const student = studentMap.get(r.student_email);
        student.correct_answers += r.correct_answers;
        student.total_questions += r.total_questions;
        student.time_taken_seconds += r.time_taken_seconds;
        if (new Date(r.completed_at) > new Date(student.completed_at)) {
          student.completed_at = r.completed_at;
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
      return searchMatch && quizMatch;
    })
    .sort((a: any, b: any) => {
      if (sortOrder === "high-to-low") {
        return b.score_percentage - a.score_percentage;
      }
      return a.score_percentage - b.score_percentage;
    });

  const exportToCSV = () => {
    const headers = ["Student Name", "Quiz Name", "Score", "Time Taken", "Date"];
    const rows = filteredResults.map((r: any) => [
      r.student_name,
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
    a.download = "quiz-results.csv";
    a.click();
    toast.success(t("common.success"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>{t("admin.results")}</CardTitle>
            <div className="flex gap-2">
              <Select value={quizFilter} onValueChange={setQuizFilter}>
                <SelectTrigger className="w-[180px]">
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

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "high-to-low" ? "low-to-high" : "high-to-low")}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "high-to-low" ? t("admin.high_to_low") : t("admin.low_to_high")}
              </Button>
              <Button onClick={exportToCSV} className="gap-2">
                <Download className="h-4 w-4" />
                {t("admin.export")}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("admin.search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.student_name")}</TableHead>
                  <TableHead>{t("admin.email")}</TableHead>
                  <TableHead>{t("admin.account_type")}</TableHead>
                  {quizFilter !== 'all' && <TableHead>{t("admin.quiz_name")}</TableHead>}
                  <TableHead>{t("admin.score")}</TableHead>
                  <TableHead>{t("admin.time_taken")}</TableHead>
                  <TableHead>{t("admin.date")}</TableHead>
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
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">{t("admin.no_results")}</TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result: any) => (
                    <TableRow key={result.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link to={`/admin/results/${result.id}`} className="font-medium text-primary hover:underline">
                          {result.student_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {result.student_email || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.has_account 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {result.has_account ? t('admin.registered') : t('admin.guest')}
                        </span>
                      </TableCell>
                      {quizFilter !== 'all' && <TableCell>{result.quiz_title[currentLang]}</TableCell>}
                      <TableCell>
                        <span className="font-semibold">{result.correct_answers}/{result.total_questions}</span>
                        <span className="ml-2 text-muted-foreground">({result.score_percentage}%)</span>
                      </TableCell>
                      <TableCell>{result.time_taken_seconds}s</TableCell>
                      <TableCell>{new Date(result.completed_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </motion.div>
  );
};

export default ResultsPage;
