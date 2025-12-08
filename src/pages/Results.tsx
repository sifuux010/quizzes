import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Trophy, RotateCcw, Home } from "lucide-react";

const Results = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) {
    navigate("/quizzes");
    return null;
  }

  const { score, total, percentage } = result;

  const getFeedback = () => {
    if (percentage >= 90) return { message: t("results.excellent"), color: "text-success" };
    if (percentage >= 70) return { message: t("results.great"), color: "text-primary" };
    if (percentage >= 50) return { message: t("results.good"), color: "text-accent" };
    return { message: t("results.needs_improvement"), color: "text-warning" };
  };

  const feedback = getFeedback();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">{t("results.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-6 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground mb-2">{t("results.your_score")}</p>
                  <p className="text-5xl font-bold text-primary">
                    {score}/{total}
                  </p>
                </div>

                <div className="p-6 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground mb-2">{t("results.percentage")}</p>
                  <p className={`text-5xl font-bold ${feedback.color}`}>
                    {percentage}%
                  </p>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-lg font-semibold ${feedback.color}`}
                >
                  {feedback.message}
                </motion.p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/quizzes")}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("results.try_again")}
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Home className="h-4 w-4" />
                  {t("results.back_home")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
