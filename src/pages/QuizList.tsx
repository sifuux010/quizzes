import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Clock, ArrowRight, BookOpen, Target, Calculator, Microscope, BookMarked, Languages, GraduationCap, Sparkles, TrendingUp, Award, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import quizee from "@/assets/quizee.jpg";
import illustration from "@/assets/3974104.jpg";
import quizIcon from "@/assets/quiz_8586891.png";
import trophyIcon from "@/assets/trophy_18947006.png";
import avgIcon from "@/assets/underure.png";

interface QuizStats {
  totalCompleted: number;
  avgScore: number;
}

const QuizList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState<QuizStats>({ totalCompleted: 0, avgScore: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizzesResponse = await fetch('https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/get_quizzes.php');
        if (!quizzesResponse.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const quizzesData = await quizzesResponse.json();
        
        const filteredQuizzes = quizzesData.filter((quiz: any) => {
          const titleEn = quiz.title?.en?.toLowerCase() || '';
          const titleFr = quiz.title?.fr?.toLowerCase() || '';
          const titleAr = quiz.title?.ar || '';
          return !titleEn.includes('general knowledge') && 
                 !titleFr.includes('culture générale') &&
                 !titleAr.includes('المعرفة العامة');
        });
        
        setQuizzes(filteredQuizzes);

        const studentEmail = localStorage.getItem("studentEmail");
        if (studentEmail) {
          const statsResponse = await fetch(`https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/get_student_stats.php?email=${encodeURIComponent(studentEmail)}`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const studentName = localStorage.getItem("studentName");
    if (!studentName) {
      navigate("/student-entry");
    }
  }, [navigate]);

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  const getDifficultyBadge = (duration: number) => {
    if (duration <= 300) return { 
      label: t("quizList.easy") || "Easy", 
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200"
    };
    if (duration <= 600) return { 
      label: t("quizList.medium") || "Medium", 
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200"
    };
    return { 
      label: t("quizList.hard") || "Hard", 
      gradient: "from-rose-500 to-pink-500",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200"
    };
  };

  const getQuizCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('math') || lowerTitle.includes('mathématiques') || lowerTitle.includes('رياضيات')) {
      return { 
        icon: Calculator, 
        gradient: "from-blue-500 via-blue-600 to-indigo-600",
        bgGradient: "from-blue-50 to-indigo-50",
        accentColor: "bg-blue-500"
      };
    }
    if (lowerTitle.includes('science') || lowerTitle.includes('علوم')) {
      return { 
        icon: Microscope, 
        gradient: "from-purple-500 via-purple-600 to-fuchsia-600",
        bgGradient: "from-purple-50 to-fuchsia-50",
        accentColor: "bg-purple-500"
      };
    }
    if (lowerTitle.includes('history') || lowerTitle.includes('histoire') || lowerTitle.includes('تاريخ')) {
      return { 
        icon: BookMarked, 
        gradient: "from-amber-500 via-orange-500 to-red-500",
        bgGradient: "from-amber-50 to-orange-50",
        accentColor: "bg-amber-500"
      };
    }
    if (lowerTitle.includes('language') || lowerTitle.includes('langue') || lowerTitle.includes('لغة')) {
      return { 
        icon: Languages, 
        gradient: "from-green-500 via-emerald-500 to-teal-500",
        bgGradient: "from-green-50 to-emerald-50",
        accentColor: "bg-green-500"
      };
    }
    return { 
      icon: GraduationCap, 
      gradient: "from-indigo-500 via-violet-500 to-purple-500",
      bgGradient: "from-indigo-50 to-violet-50",
      accentColor: "bg-indigo-500"
    };
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500" />
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mx-auto">
                  <Target className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-3 text-gray-900">{t("common.error")}</h3>
                  <p className="text-gray-600 text-lg">{error}</p>
                </div>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="rounded-xl px-8 h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-semibold"
                >
                  {t("common.retry") || "Try Again"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="flex-1 px-0 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="container max-w-7xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
           <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8 relative overflow-hidden rounded-3xl"
                >
              <Card className="border-0 shadow-2xl rounded-3xl rounded-b-3xl overflow-hidden bg-gradient-to-r from-cyan-100 via-cyan-50 to-white">
                <CardContent className="p-8 sm:py-0 sm:p-10 relative rounded-b-3xl">
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative grid md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-3 space-y-4">
                      <div className="flex items-center gap-3">
                       
                        <h2 className={`text-2xl sm:text-3xl font-bold text-gray-800 ${i18n.language === 'ar' ? 'rtl' : ''}`}>
                          {t("quizList.helloName", { name: localStorage.getItem("studentName") || t("common.student") })}
                        </h2>
                      </div>
                     <p className={`text-gray-700 text-base sm:text-lg leading-relaxed font-medium ${i18n.language === 'ar' ? 'rtl text-right' : ''}`}>
                       {quizzes ? t("quizList.todayMessage", { count: quizzes.length }) : t("common.loading")}
                     </p>
                     <Button
                      onClick={() => {
                        const quizSection = document.getElementById('quiz-cards-section');
                        if (quizSection) {
                          quizSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-bold px-6 h-11 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className={i18n.language === 'ar' ? 'rtl' : ''}>
                        {t("quizList.startNow")}
                      </span>
                    </Button>
                    </div>
                    
                    {/* Illustration area */}
                    <div className="md:col-span-2 flex justify-center">
                      <div className="w-full max-w-xs ">
                        <img 
                          src={illustration} 
                          alt="Quiz Illustration" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="relative">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl" />
              <div className="absolute -top-4 -right-8 w-40 h-40 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="mb-4 inline-block">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight font-['Poppins']">
                    {t("quizList.title")}
                  </h1>
                  <div className="mt-2 relative">
                    <svg 
                      className="w-full" 
                      height="12"
                      viewBox="0 0 200 12" 
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,7 Q50,2 100,7 T200,7" 
                        fill="none"
                        stroke="url(#underlineGradient)" 
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 text-lg sm:text-xl max-w-2xl leading-relaxed">
                  {t("quizList.subtitle")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quiz Cards Section */}
          <div id="quiz-cards-section" className="scroll-mt-20">
          {quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            
            {/* Mobile Layout */}
            <div className="sm:hidden space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur opacity-20" />
                          <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                            <img src={quizIcon} alt="Quizzes" className="w-8 h-8" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-cyan-500">
                            {quizzes.length}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 mt-1">
                            {t("quizList.available") || "Available"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl blur opacity-20" />
                          <div className="relative w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
                            <img src={trophyIcon} alt="Completed" className="w-8 h-8" />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            {stats.totalCompleted}
                          </p>
                          <p className="text-xs font-semibold text-gray-600 mt-1">
                            {t("quizList.completed") || "Completed"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group w-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6 relative">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl blur opacity-20" />
                        <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 flex-shrink-0">
                          <img src={avgIcon} alt="Average Score" className="w-9 h-9" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-2">
                          {t("quizList.avgScore") || "Average Score"}
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {stats.avgScore > 0 ? `${stats.avgScore.toFixed(0)}%` : '--'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-6">
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-md opacity-20" />
                        <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 flex-shrink-0">
                          <img src={quizIcon} alt="Quizzes" className="w-9 h-9" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          {t("quizList.available") || "Available Quizzes"}
                        </p>
                        <p className="text-4xl font-bold text-cyan-500">
                          {quizzes.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl blur-md opacity-20" />
                        <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 flex-shrink-0">
                          <img src={trophyIcon} alt="Completed" className="w-9 h-9" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          {t("quizList.completed") || "Completed"}
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                          {stats.totalCompleted}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-8 relative">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl blur-md opacity-20" />
                        <div className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 flex-shrink-0">
                          <img src={avgIcon} alt="Average Score" className="w-9 h-9" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                          {t("quizList.avgScore") || "Average Score"}
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                          {stats.avgScore > 0 ? `${stats.avgScore.toFixed(0)}%` : '--'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
          )}

          {/* Quiz Cards Grid */}
          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900">{t("quizList.noQuizzes") || "No Quizzes Available"}</h3>
              <p className="text-gray-600 text-lg">{t("quizList.checkBack") || "Check back later for new quizzes"}</p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz, index) => {
                const difficulty = getDifficultyBadge(quiz.duration);
                const category = getQuizCategory(quiz.title[currentLang]);
                const CategoryIcon = category.icon;
                
                return (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col group rounded-3xl overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                     <CardContent className="p-0 flex-1 flex relative">
                      
                      <div className="w-[20%] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-r border-gray-200">
                        <img src={quizee} alt="Quiz" className="w-full h-full object-cover" />
                      </div>
                      
                      
                        <div className="flex-1 p-6 flex flex-col">
                         
                          <div className="flex-1 mb-4">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-700 transition-colors leading-tight">
                              {quiz.title[currentLang]}
                            </h3>
                          </div>
                          
                          {/* Meta info with icons */}
                          <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                            <div className="flex items-center gap-2.5 text-gray-600">
                              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-sm">{Math.floor(quiz.duration / 60)}</span>
                                <span className="text-xs text-gray-500 ml-1">{t("quizList.minutes") || "min"}</span>
                              </div>
                            </div>
                            <div className="w-px h-9 bg-gray-200" />
                            <div className="flex items-center gap-2.5 text-gray-600">
                              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-sm">36</span>
                                <span className="text-xs text-gray-500 ml-1">{t("quizList.questions") || "Q's"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Start button */}
                          <Button 
                            onClick={() => handleStartQuiz(quiz.id)} 
                            className="w-full font-bold shadow-lg hover:shadow-xl transition-all rounded-2xl h-12 bg-cyan-500 hover:bg-cyan-600 text-white group-hover:scale-[1.02]"
                          >
                            {t("quizList.start")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;