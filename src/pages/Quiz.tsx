import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Flag } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LanguageToggle } from "@/components/LanguageToggle";

const Quiz = () => {
  const { quizId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as 'en' | 'fr' | 'ar';

  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [startTime, setStartTime] = useState(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        navigate('/quizzes');
        return;
      }
      try {
        const response = await fetch(`https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/get_quiz.php?id=${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
        }
        const data = await response.json();
        setQuiz(data);
        setTimeLeft(data.duration || 600);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  useEffect(() => {
    if (isLoading || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, quiz]);

  const handleSubmit = async () => {
    if (!quiz) return;

    const studentAnswers = quiz.questions.map((q: any) => {
      const selectedOptionIndex = answers[q.id] ?? -1;
      return {
        questionId: q.id,
        selectedOptionIndex,
        isCorrect: selectedOptionIndex === q.correct_option_index,
      };
    });

    const submissionData = {
      student: {
        name: localStorage.getItem("studentName") || "Anonymous",
        email: localStorage.getItem("studentEmail") || "",
        phone: localStorage.getItem("studentPhone") || "",
      },
      quizId: quiz.id,
      answers: studentAnswers,
      startTime: startTime,
    };

    try {
      const response = await fetch('https://lightseagreen-alpaca-114967.hostingersite.com/backend/api/submit_quiz.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      if (result.alreadyAttempted) {
        const totalQ = quiz.questions.length;
        const inferredScore = Math.round(((result.percentage || 0) / 100) * totalQ);
        navigate("/results", { state: { ...result, score: inferredScore, total: totalQ, quizName: quiz.title[currentLang] } });
      } else {
        result.quizName = quiz.title[currentLang];
        navigate("/results", { state: result });
      }

    } catch (err) {
      console.error(err);
      alert('There was an error submitting your quiz. Please try again.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getUnansweredCount = () => {
    return quiz.questions.length - getAnsweredCount();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg font-medium">{t("common.loading")}</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("common.error")}: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const isAnswered = answers[question.id] !== undefined;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="hidden sm:block">
        <Navbar />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Mobile: Minimal top bar with circular progress and timer */}
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Circular Progress */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                  className="text-blue-600 transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">{currentQuestion + 1}/{quiz.questions.length}</span>
              </div>
            </div>

           <div className="flex items-center gap-2">
            <LanguageToggle />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors ${
              timeLeft < 60 ? "bg-red-100 text-red-700" : 
              timeLeft < 180 ? "bg-orange-100 text-orange-700" : 
              "bg-blue-100 text-blue-700"
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          </div>
        </div>

        {/* Desktop: Full header */}
        <div className="hidden sm:block px-4 py-6">
          <div className="container max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card className="rounded-lg border shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">{quiz.title[currentLang]}</h1>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {getAnsweredCount()} {t("quiz.answered") || "answered"}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          {getUnansweredCount()} {t("quiz.remaining") || "remaining"}
                        </span>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition-colors ${
                        timeLeft < 60 ? "bg-red-100 text-red-700" : 
                        timeLeft < 180 ? "bg-orange-100 text-orange-700" : 
                        "bg-blue-100 text-blue-700"
                      }`}>
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="mb-4 space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">
                  {t("quiz.question")} {currentQuestion + 1} {t("quiz.of")} {quiz.questions.length}
                </span>
                <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Question Card - Full height on mobile */}
        <div className="flex-1 flex flex-col sm:px-4 pb-28 sm:pb-6">
          <div className="container max-w-4xl mx-auto flex-1 flex flex-col sm:block pt-16 sm:pt-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestion}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="flex-1 flex flex-col"
              >
                <Card className="rounded-none sm:rounded-2xl border-0 sm:border shadow-none sm:shadow-xl overflow-hidden flex-1 flex flex-col">
                  <CardContent className="p-4 sm:p-6 space-y-6 flex-1 flex flex-col justify-center">
                    {/* Question Header */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {currentQuestion + 1}
                      </div>
                      <h2 className="flex-1 text-lg sm:text-xl font-bold text-gray-900 leading-tight pt-1">
                        {question.question_text[currentLang]}
                      </h2>
                    </div>

                    {/* OPTIONS */}
                    <RadioGroup
                      value={answers[question.id]?.toString() || ""}
                      onValueChange={(value) => {
                        setAnswers({ ...answers, [question.id]: parseInt(value, 10) });
                      }}
                      className="flex flex-col gap-3"
                    >
                      {question.options.map((option: string, index: number) => {
                        const isSelected = answers[question.id] === index;
                        const optionLetter = String.fromCharCode(65 + index);

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Label
                              htmlFor={`option-${index}`}
                              className={`flex items-center gap-3 border-2 rounded-xl p-4 py-5 transition-all cursor-pointer group min-h-[70px] sm:min-h-[80px] ${
                                isSelected
                                  ? "border-cyan-500 bg-cyan-50 shadow-md ring-1 ring-cyan-300"
                                  : "border-gray-200 hover:border-cyan-300 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                                  isSelected
                                    ? "bg-cyan-500 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600"
                                }`}
                              >
                                {optionLetter}
                              </div>

                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                className="sr-only"
                              />

                              <span className="flex-1 font-semibold text-base sm:text-lg text-gray-900 leading-snug">
                                {option[currentLang]}
                              </span>
                            </Label>
                          </motion.div>
                          
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* FIXED NAVIGATION (mobile bottom) */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 sm:static sm:border-0 sm:p-0 sm:mt-4">
                  {!showSubmitConfirm ? (
                    <div className="flex gap-3">
                      {/* Previous */}
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0}
                        className="flex-1 font-semibold rounded-xl h-12 text-cyan-600 border-cyan-400"
                      >
                        <ChevronLeft className="h-5 w-5 sm:mr-1" />
                        <span className="hidden sm:inline">{t("quiz.previous")}</span>
                      </Button>

                      {/* Next or Submit */}
                      {isLastQuestion ? (
                        <Button 
                          size="lg"
                          onClick={() => setShowSubmitConfirm(true)}
                          className="flex-1 font-semibold rounded-xl h-12 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
                          disabled={getUnansweredCount() > 0}
                        >
                          <span className="hidden sm:inline">{t("quiz.submit")}</span>
                          <Flag className="h-5 w-5 sm:ml-1" />
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          onClick={handleNextQuestion}
                          disabled={!isAnswered}
                          className="flex-1 font-semibold rounded-xl h-12 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg"
                        >
                          <span className="hidden sm:inline">{t("quiz.next")}</span>
                          <ChevronRight className="h-5 w-5 sm:ml-1" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        size="lg"
                        onClick={handleSubmit}
                        className="w-full bg-green-600 hover:bg-green-700 font-semibold rounded-xl h-12"
                      >
                        {t("quiz.confirmSubmit") || "Confirm Submit"}
                      </Button>

                      <Button 
                        variant="outline"
                        size="lg"
                        onClick={() => setShowSubmitConfirm(false)}
                        className="w-full rounded-xl h-12"
                      >
                        {t("common.cancel") || "Cancel"}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>


        {/* Desktop: Unanswered warning on last question */}
        {isLastQuestion && getUnansweredCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden sm:block mt-4"
          >
            <Alert className="border-orange-500/50 bg-orange-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm text-orange-700">
                {t("quiz.unansweredWarning") || `You have ${getUnansweredCount()} unanswered question(s). Please answer all questions before submitting.`}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quiz;